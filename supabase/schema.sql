create extension if not exists pgcrypto;
create extension if not exists vector;

create table if not exists merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  whatsapp_phone text,
  whatsapp_phone_number_id text,
  logo_url text,
  created_at timestamptz not null default now()
);

alter table merchants
  add column if not exists whatsapp_phone_number_id text;

create unique index if not exists merchants_whatsapp_phone_number_id_uidx
  on merchants(whatsapp_phone_number_id)
  where whatsapp_phone_number_id is not null;

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  whatsapp_phone text not null,
  name text,
  created_at timestamptz not null default now(),
  unique (merchant_id, whatsapp_phone)
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  name text not null,
  category text,
  sku text,
  description text,
  price_yer integer not null check (price_yer >= 0),
  stock integer not null default 0 check (stock >= 0),
  low_stock_threshold integer not null default 5,
  image_url text,
  embedding vector(768),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists products_merchant_active_idx on products(merchant_id, active);
create index if not exists products_embedding_hnsw_idx
  on products using hnsw (embedding vector_cosine_ops);

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  status text not null default 'active'
    check (status in ('active','checkout','abandoned','converted','cancelled')),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_price_yer integer not null check (unit_price_yer >= 0),
  unique (cart_id, product_id)
);

create table if not exists orders (
  id text primary key,
  merchant_id uuid not null references merchants(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  status text not null default 'pending_payment'
    check (status in ('pending_payment','payment_review','confirmed','rejected','cancelled')),
  total_yer integer not null check (total_yer >= 0),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(id) on delete cascade,
  product_id uuid not null references products(id),
  quantity integer not null check (quantity > 0),
  unit_price_yer integer not null check (unit_price_yer >= 0)
);

create table if not exists payment_receipts (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references orders(id) on delete cascade,
  provider text not null check (provider in ('jib','alkuraimi','onecash','other')),
  amount_yer integer,
  reference text,
  image_url text,
  ai_confidence numeric(4,3),
  status text not null default 'pending'
    check (status in ('pending','ready_for_review','confirmed','rejected')),
  rejection_reason text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  wa_message_id text,
  direction text not null check (direction in ('inbound','outbound')),
  message_type text not null,
  text_body text,
  media_id text,
  created_at timestamptz not null default now()
);

create unique index if not exists whatsapp_messages_dedupe_uidx
  on whatsapp_messages(merchant_id, wa_message_id)
  where wa_message_id is not null;

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references merchants(id) on delete cascade,
  action text not null,
  entity_type text not null,
  entity_id text,
  actor_type text not null check (actor_type in ('merchant','ai','system')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function approve_order(
  p_order_id text,
  p_payment_receipt_id uuid default null
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_order orders%rowtype;
  v_item record;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'Order % not found', p_order_id; end if;

  if v_order.status = 'confirmed' then
    return jsonb_build_object('success', true, 'already_confirmed', true, 'order_id', v_order.id);
  end if;

  for v_item in
    select oi.product_id, oi.quantity, p.name, p.stock
    from order_items oi join products p on p.id = oi.product_id
    where oi.order_id = p_order_id
    for update of p
  loop
    if v_item.stock < v_item.quantity then
      raise exception 'Insufficient stock for %', v_item.name;
    end if;
  end loop;

  for v_item in select product_id, quantity from order_items where order_id = p_order_id
  loop
    update products set stock = stock - v_item.quantity where id = v_item.product_id;
  end loop;

  update orders set status = 'confirmed', confirmed_at = now() where id = p_order_id;

  if p_payment_receipt_id is not null then
    update payment_receipts
    set status = 'confirmed', reviewed_at = now()
    where id = p_payment_receipt_id;
  end if;

  insert into audit_logs(merchant_id, action, entity_type, entity_id, actor_type, metadata)
  values (
    v_order.merchant_id, 'order_confirmed', 'order', v_order.id, 'merchant',
    jsonb_build_object('payment_receipt_id', p_payment_receipt_id)
  );

  return jsonb_build_object(
    'success', true,
    'order_id', v_order.id,
    'inventory_deducted', true,
    'invoice_queued', true
  );
end;
$$;

create or replace function reject_order(
  p_order_id text,
  p_payment_receipt_id uuid default null,
  p_reason text default 'Rejected by merchant.'
)
returns jsonb
language plpgsql
security definer
as $$
declare
  v_order orders%rowtype;
begin
  select * into v_order from orders where id = p_order_id for update;
  if not found then raise exception 'Order % not found', p_order_id; end if;

  update orders set status = 'rejected' where id = p_order_id;

  if p_payment_receipt_id is not null then
    update payment_receipts
    set status = 'rejected', rejection_reason = p_reason, reviewed_at = now()
    where id = p_payment_receipt_id;
  end if;

  insert into audit_logs(merchant_id, action, entity_type, entity_id, actor_type, metadata)
  values (
    v_order.merchant_id, 'order_rejected', 'order', v_order.id, 'merchant',
    jsonb_build_object('reason', p_reason, 'payment_receipt_id', p_payment_receipt_id)
  );

  return jsonb_build_object(
    'success', true,
    'order_id', v_order.id,
    'inventory_deducted', false,
    'reason', p_reason
  );
end;
$$;

create or replace function match_products(
  query_embedding vector(768),
  match_merchant_id uuid,
  match_count int default 10
)
returns table (
  id uuid,
  name text,
  category text,
  price_yer integer,
  stock integer,
  similarity float
)
language sql
stable
as $$
  select
    p.id,
    p.name,
    p.category,
    p.price_yer,
    p.stock,
    1 - (p.embedding <=> query_embedding) as similarity
  from products p
  where p.merchant_id = match_merchant_id
    and p.active = true
    and p.embedding is not null
  order by p.embedding <=> query_embedding
  limit match_count;
$$;


-- Security hardening: server-side service-role access only.
alter table public.merchants enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.carts enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_receipts enable row level security;
alter table public.whatsapp_messages enable row level security;
alter table public.audit_logs enable row level security;

alter function public.approve_order(text, uuid) set search_path = public;
alter function public.reject_order(text, uuid, text) set search_path = public;
alter function public.match_products(vector, uuid, integer) set search_path = public;

revoke execute on function public.approve_order(text, uuid) from public, anon, authenticated;
revoke execute on function public.reject_order(text, uuid, text) from public, anon, authenticated;
revoke execute on function public.match_products(vector, uuid, integer) from public, anon, authenticated;
grant execute on function public.approve_order(text, uuid) to service_role;
grant execute on function public.reject_order(text, uuid, text) to service_role;
grant execute on function public.match_products(vector, uuid, integer) to service_role;
