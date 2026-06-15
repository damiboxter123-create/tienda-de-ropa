create extension if not exists "pgcrypto";

create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  description text not null,
  price numeric(12, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  image_urls text[] not null default '{}',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  change integer not null,
  reason text,
  created_at timestamptz not null default now()
);

create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_featured_idx on public.products(featured);
create index if not exists products_stock_idx on public.products(stock);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.inventory_movements enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
on public.categories for select
using (true);

drop policy if exists "Public can read products" on public.products;
create policy "Public can read products"
on public.products for select
using (true);

drop policy if exists "Admins can read own admin record" on public.admins;
create policy "Admins can read own admin record"
on public.admins for select
using (auth.uid() = id);

insert into public.categories (name, slug) values
  ('Remeras', 'remeras'),
  ('Pantalones', 'pantalones'),
  ('Camperas', 'camperas'),
  ('Zapatillas', 'zapatillas'),
  ('Accesorios', 'accesorios')
on conflict (slug) do nothing;

insert into public.products (category_id, name, description, price, stock, sizes, colors, image_urls, featured)
select c.id, 'Remera oversize', 'Algodon premium con corte urbano.', 18500, 8, array['S','M','L'], array['Negro','Blanco'], array['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80'], true
from public.categories c where c.slug = 'remeras'
on conflict do nothing;

insert into public.products (category_id, name, description, price, stock, sizes, colors, image_urls, featured)
select c.id, 'Jean recto azul', 'Denim resistente para uso diario.', 42000, 5, array['38','40','42'], array['Azul'], array['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80'], true
from public.categories c where c.slug = 'pantalones'
on conflict do nothing;

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can view product images" on storage.objects;
create policy "Public can view product images"
on storage.objects for select
using (bucket_id = 'product-images');

drop policy if exists "Authenticated users can upload product images" on storage.objects;
create policy "Authenticated users can upload product images"
on storage.objects for insert
with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
