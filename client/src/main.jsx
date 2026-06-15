import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BadgeCheck,
  BarChart3,
  Clock3,
  Edit,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trash2,
  Truck,
  Upload
} from 'lucide-react';
import './styles.css';
import { api, getSessionToken } from './lib/api';
import { supabase, supabaseReady } from './lib/supabase';

const store = {
  name: import.meta.env.VITE_STORE_NAME || 'Gonzalez Style',
  city: import.meta.env.VITE_STORE_CITY || 'Bella Vista, Corrientes',
  whatsapp: import.meta.env.VITE_WHATSAPP_NUMBER || '5493777606030'
};

const emptyProduct = {
  name: '',
  description: '',
  price: '',
  stock: 0,
  sizes: '',
  colors: '',
  category_id: '',
  featured: false,
  image_urls: []
};

function formatPrice(value) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function normalizeList(value) {
  if (Array.isArray(value)) return value;
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function App() {
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const navigate = (nextPath) => {
    window.history.pushState({}, '', nextPath);
    setPath(nextPath);
    window.scrollTo(0, 0);
  };

  if (path.startsWith('/login')) return <LoginPage navigate={navigate} />;
  if (path.startsWith('/admin')) return <AdminPage navigate={navigate} />;
  return <Storefront navigate={navigate} />;
}

function Storefront({ navigate }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api('/products'), api('/categories')])
      .then(([productData, categoryData]) => {
        setProducts(productData);
        setCategories(categoryData);
      })
      .catch(() => {
        setProducts([]);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const featured = products.filter((product) => product.featured).slice(0, 4);
  const buyingSteps = [
    { title: 'Explora el catálogo', text: 'Filtrá por categoría y encontrá prendas que se adapten a tu estilo.' },
    { title: 'Consultá por WhatsApp', text: 'Armá tu carrito y enviá el pedido directo para confirmar talle, color y stock.' },
    { title: 'Retirá o coordiná entrega', text: 'Podés acercarte en Bella Vista o resolver la compra por contacto directo.' }
  ];

  const testimonials = [
    { name: 'María', text: 'La ropa es muy cómoda y el diseño está súper actual; me encanta comprar por WhatsApp.' },
    { name: 'Sofía', text: 'Todo muy claro, rápido y con buena atención. Me sirvió mucho para encontrar talles.' },
    { name: 'Lucía', text: 'La tienda se ve muy prolija y me resulta fácil elegir prendas para uso diario.' }
  ];

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const text = `${product.name} ${product.description}`.toLowerCase();
      const matchesSearch = text.includes(query.toLowerCase());
      const matchesCategory = category === 'all' || product.category_id === category;
      return matchesSearch && matchesCategory;
    });
  }, [products, query, category]);

  const addToCart = (product) => {
    setCart((items) => {
      const found = items.find((item) => item.id === product.id);
      if (found) {
        return items.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...items, { id: product.id, name: product.name, price: product.price, quantity: 1 }];
    });
  };

  const whatsappText = encodeURIComponent(
    cart.length
      ? `Hola ${store.name}, quiero consultar por: ${cart.map((item) => `${item.quantity} ${item.name}`).join(', ')}`
      : `Hola ${store.name}, quiero consultar por la ropa disponible.`
  );

  return (
    <main className="min-h-screen bg-stone-50 text-ink">
      <Header cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)} navigate={navigate} />

      <section className="bg-ink text-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">{store.city}</p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight md:text-6xl">{store.name}</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-200">
              Ropa urbana, comoda y actual para comprar cerca, probar tranquilo y consultar directo por WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a className="btn-primary" href={`https://wa.me/${store.whatsapp}?text=${whatsappText}`} target="_blank" rel="noreferrer">
                <MessageCircle size={18} /> Consultar por WhatsApp
              </a>
              <a className="btn-secondary" href="#catalogo">Ver catálogo</a>
            </div>
            <p className="mt-4 text-sm text-stone-300">Contacto directo para talles, precios y disponibilidad.</p>
          </div>
          <div className="grid min-h-[360px] grid-cols-2 gap-3">
            {heroImages.map((image, index) => (
              <img
                key={image}
                className={`h-full w-full object-cover ${index === 0 ? 'col-span-2 rounded-t-lg' : 'rounded-b-lg'}`}
                src={image}
                alt="Ropa destacada de tienda"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <SectionTitle icon={<Star size={22} />} title="Productos destacados" />
        {products.length ? (
          <ProductGrid products={featured.length ? featured : products.slice(0, 4)} onAdd={addToCart} />
        ) : (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center shadow-sm">
            <p className="text-lg font-black text-stone-900">Próximamente publicaremos la colección.</p>
            <p className="mt-2 text-sm text-stone-600">Por ahora, podés consultar por WhatsApp para ver talles, precios y disponibilidad.</p>
          </div>
        )}
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <SectionTitle icon={<ShieldCheck size={22} />} title="Por qué elegirnos" />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              ['Estilo urbano', 'Prendas modernas, cómodas y pensadas para usar todos los días.'],
              ['Atención directa', 'Respondemos consultas rápido por WhatsApp para que compres con confianza.'],
              ['Stock actualizado', 'Mostramos disponibilidad real para que sepas qué podés llevarte.']
            ].map(([title, text]) => (
              <article key={title} className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
                <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-600">{title}</p>
                <p className="mt-3 text-sm leading-6 text-stone-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <SectionTitle icon={<Truck size={22} />} title="Cómo comprar" />
        <div className="grid gap-4 md:grid-cols-3">
          {buyingSteps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-black text-amber-600">Paso {index + 1}</p>
              <h3 className="mt-2 text-xl font-black">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-stone-600">{step.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <SectionTitle icon={<BadgeCheck size={22} />} title="Lo que dicen nuestras clientas" />
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-2xl border border-stone-200 bg-stone-50 p-5 shadow-sm">
                <p className="text-sm leading-6 text-stone-700">“{item.text}”</p>
                <p className="mt-4 text-sm font-black text-stone-900">— {item.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="panel">
            <h2 className="panel-title"><MapPin size={18} /> Información de contacto</h2>
            <p className="text-sm leading-6 text-stone-600">Estamos en {store.city} y atendemos consultas por WhatsApp para ayudarte a elegir talle, color y estilo.</p>
            <div className="mt-4 space-y-3 text-sm text-stone-700">
              <p className="flex items-center gap-2"><MapPin size={16} /> {store.city}</p>
              <p className="flex items-center gap-2"><MessageCircle size={16} /> WhatsApp: {store.whatsapp}</p>
              <p className="flex items-center gap-2"><Clock3 size={16} /> Atención directa y rápida por consulta.</p>
            </div>
          </article>
          <article className="panel">
            <h2 className="panel-title"><ShoppingBag size={18} /> ¿Listo para ver la colección?</h2>
            <p className="text-sm leading-6 text-stone-600">Explorá el catálogo, agregá productos al carrito y consultanos el total cuando prefieras.</p>
            <a className="btn-primary mt-4 inline-flex" href="#catalogo">Ir al catálogo</a>
          </article>
        </div>
      </section>

      <section id="catalogo" className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <SectionTitle icon={<ShoppingBag size={22} />} title="Catalogo" />
          <div className="mb-6 grid gap-3 md:grid-cols-[1fr_auto]">
            <label className="relative">
              <Search className="absolute left-3 top-3 text-stone-400" size={18} />
              <input
                className="input pl-10"
                placeholder="Buscar remeras, camperas, zapatillas..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
            <select className="input md:w-72" value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="all">Todas las categorias</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>
          {loading ? <p className="text-stone-500">Cargando productos...</p> : (
            products.length ? <ProductGrid products={visibleProducts} onAdd={addToCart} /> : <p className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-stone-500">Todavía no hay productos publicados. El administrador los cargará cuando esté listo.</p>
          )}
        </div>
      </section>

      <CartPanel cart={cart} setCart={setCart} whatsappText={whatsappText} />
      <a className="fixed bottom-5 right-5 z-20 rounded-full bg-emerald-600 p-4 text-white shadow-xl" href={`https://wa.me/${store.whatsapp}?text=${whatsappText}`} target="_blank" rel="noreferrer" aria-label="Contactar por WhatsApp">
        <MessageCircle />
      </a>
    </main>
  );
}

function Header({ cartCount, navigate }) {
  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <button className="text-left" onClick={() => navigate('/')}>
          <span className="block text-xl font-black">{store.name}</span>
          <span className="text-xs text-stone-500">{store.city}</span>
        </button>
        <nav className="flex items-center gap-3">
          <a className="hidden text-sm font-semibold text-stone-700 sm:block" href="#catalogo">Catalogo</a>
          <button className="icon-button" onClick={() => navigate('/login')} title="Administrador">
            <Package size={18} />
          </button>
          <span className="rounded-full bg-stone-900 px-3 py-1 text-sm font-bold text-white">{cartCount}</span>
        </nav>
      </div>
    </header>
  );
}

function ProductGrid({ products, onAdd }) {
  if (!products.length) return <p className="rounded-lg border border-dashed border-stone-300 p-8 text-center text-stone-500">No hay productos para mostrar.</p>;
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} onAdd={onAdd} />
      ))}
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  const image = product.image_urls?.[0] || fallbackImage;
  return (
    <article className="overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm">
      <img className="h-56 w-full object-cover" src={image} alt={product.name} />
      <div className="space-y-3 p-4">
        <div>
          <h3 className="text-lg font-extrabold">{product.name}</h3>
          <p className="line-clamp-2 min-h-12 text-sm leading-6 text-stone-600">{product.description}</p>
        </div>
        <p className="text-2xl font-black">{formatPrice(product.price)}</p>
        <div className="space-y-2 text-sm">
          <p><strong>Talles:</strong> {normalizeList(product.sizes).join(', ') || 'Consultar'}</p>
          <p><strong>Colores:</strong> {normalizeList(product.colors).join(', ') || 'Consultar'}</p>
          <p><strong>Stock:</strong> {product.stock > 0 ? `${product.stock} disponible` : 'Sin stock'}</p>
        </div>
        <button className="btn-dark w-full" disabled={product.stock <= 0} onClick={() => onAdd(product)}>
          <ShoppingBag size={18} /> Agregar
        </button>
      </div>
    </article>
  );
}

function CartPanel({ cart, setCart, whatsappText }) {
  const total = cart.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  return (
    <aside className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="rounded-lg border border-stone-200 bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black">Carrito</h2>
          <p className="font-bold">{formatPrice(total)}</p>
        </div>
        <div className="mt-4 space-y-3">
          {cart.length === 0 && <p className="text-sm text-stone-500">Agrega productos para armar tu consulta.</p>}
          {cart.map((item) => (
            <div className="flex items-center justify-between gap-3 border-t border-stone-100 pt-3" key={item.id}>
              <span className="font-semibold">{item.quantity} x {item.name}</span>
              <button className="text-sm font-bold text-red-600" onClick={() => setCart(cart.filter((cartItem) => cartItem.id !== item.id))}>Quitar</button>
            </div>
          ))}
        </div>
        <a className="btn-primary mt-5 inline-flex" href={`https://wa.me/${store.whatsapp}?text=${whatsappText}`} target="_blank" rel="noreferrer">
          <MessageCircle size={18} /> Consultar compra
        </a>
      </div>
    </aside>
  );
}

function LoginPage({ navigate }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!supabaseReady) throw new Error('Falta configurar Supabase en client/.env');
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) throw authError;
      const token = await getSessionToken();
      await api('/admin/summary', { token });
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-stone-100 px-4">
      <form className="w-full max-w-md rounded-lg border border-stone-200 bg-white p-6 shadow-sm" onSubmit={submit}>
        <h1 className="text-2xl font-black">Administrador</h1>
        <p className="mt-2 text-sm text-stone-500">Ingresar al panel privado de {store.name}.</p>
        <label className="mt-6 block text-sm font-bold">Correo electronico</label>
        <input className="input mt-2" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label className="mt-4 block text-sm font-bold">Contrasena</label>
        <input className="input mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {error && <p className="mt-4 rounded-md bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
        <button className="btn-dark mt-6 w-full" disabled={loading}>{loading ? 'Ingresando...' : 'Ingresar'}</button>
        <button className="mt-4 w-full text-sm font-bold text-stone-500" type="button" onClick={() => navigate('/')}>Volver a la tienda</button>
      </form>
    </main>
  );
}

function AdminPage({ navigate }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [message, setMessage] = useState('');

  const loadAdmin = async () => {
    const token = await getSessionToken();
    const [productData, categoryData, summaryData] = await Promise.all([
      api('/admin/products', { token }),
      api('/admin/categories', { token }),
      api('/admin/summary', { token })
    ]);
    setProducts(productData);
    setCategories(categoryData);
    setSummary(summaryData);
  };

  useEffect(() => {
    loadAdmin().catch(() => navigate('/login'));
  }, []);

  const saveProduct = async (event) => {
    event.preventDefault();
    const token = await getSessionToken();
    const payload = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      sizes: normalizeList(form.sizes),
      colors: normalizeList(form.colors)
    };
    await api(editingId ? `/admin/products/${editingId}` : '/admin/products', {
      method: editingId ? 'PUT' : 'POST',
      token,
      body: payload
    });
    setForm(emptyProduct);
    setEditingId(null);
    setMessage('Producto guardado');
    await loadAdmin();
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setForm({
      ...product,
      sizes: normalizeList(product.sizes).join(', '),
      colors: normalizeList(product.colors).join(', ')
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async (id) => {
    if (!confirm('Eliminar producto?')) return;
    const token = await getSessionToken();
    await api(`/admin/products/${id}`, { method: 'DELETE', token });
    await loadAdmin();
  };

  const createCategory = async (event) => {
    event.preventDefault();
    const token = await getSessionToken();
    await api('/admin/categories', { method: 'POST', token, body: { name: categoryName } });
    setCategoryName('');
    await loadAdmin();
  };

  const uploadImages = async (files) => {
    if (!supabaseReady) {
      setMessage('Configura Supabase para subir imagenes.');
      return;
    }
    const urls = [];
    for (const file of files) {
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('product-images').getPublicUrl(path);
      urls.push(data.publicUrl);
    }
    setForm((current) => ({ ...current, image_urls: [...(current.image_urls || []), ...urls] }));
  };

  const logout = async () => {
    if (supabaseReady) await supabase.auth.signOut();
    navigate('/');
  };

  const outOfStock = products.filter((product) => product.stock <= 0);

  return (
    <main className="min-h-screen bg-stone-100 text-ink">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <div>
            <h1 className="text-xl font-black">Panel de {store.name}</h1>
            <p className="text-sm text-stone-500">Gestion de catalogo e inventario</p>
          </div>
          <button className="btn-light" onClick={logout}><LogOut size={18} /> Salir</button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[380px_1fr] md:px-8">
        <section className="space-y-6">
          <Dashboard summary={summary} />

          <form className="panel" onSubmit={createCategory}>
            <h2 className="panel-title">Categorias</h2>
            <div className="flex gap-2">
              <input className="input" placeholder="Nueva categoria" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} required />
              <button className="icon-button bg-ink text-white" title="Crear categoria"><Plus size={18} /></button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {categories.map((item) => <span className="badge" key={item.id}>{item.name}</span>)}
            </div>
          </form>

          <form className="panel" onSubmit={saveProduct}>
            <h2 className="panel-title">{editingId ? 'Editar producto' : 'Agregar producto'}</h2>
            <input className="input" placeholder="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
            <textarea className="input min-h-24" placeholder="Descripcion" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <input className="input" placeholder="Precio" type="number" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} required />
              <input className="input" placeholder="Stock" type="number" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} required />
            </div>
            <input className="input" placeholder="Talles, separados por coma" value={form.sizes} onChange={(event) => setForm({ ...form, sizes: event.target.value })} />
            <input className="input" placeholder="Colores, separados por coma" value={form.colors} onChange={(event) => setForm({ ...form, colors: event.target.value })} />
            <select className="input" value={form.category_id || ''} onChange={(event) => setForm({ ...form, category_id: event.target.value })} required>
              <option value="">Elegir categoria</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" checked={form.featured} onChange={(event) => setForm({ ...form, featured: event.target.checked })} />
              Producto destacado
            </label>
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 p-4 text-sm font-bold text-stone-600">
              <Upload size={18} /> Subir imagenes
              <input className="hidden" type="file" multiple accept="image/*" onChange={(event) => uploadImages([...event.target.files])} />
            </label>
            {!!form.image_urls?.length && <div className="grid grid-cols-3 gap-2">{form.image_urls.map((url) => <img className="h-20 rounded-md object-cover" src={url} key={url} alt="" />)}</div>}
            {message && <p className="text-sm font-bold text-mint">{message}</p>}
            <button className="btn-dark w-full">{editingId ? 'Actualizar' : 'Crear producto'}</button>
          </form>
        </section>

        <section className="space-y-6">
          <div className="panel">
            <h2 className="panel-title">Productos sin stock</h2>
            {outOfStock.length ? outOfStock.map((product) => <p className="border-t border-stone-100 py-2 text-sm" key={product.id}>{product.name}</p>) : <p className="text-sm text-stone-500">No hay productos sin stock.</p>}
          </div>

          <div className="panel">
            <h2 className="panel-title">Productos</h2>
            <div className="space-y-3">
              {products.map((product) => (
                <div className="grid gap-3 rounded-lg border border-stone-200 p-3 md:grid-cols-[88px_1fr_auto]" key={product.id}>
                  <img className="h-24 w-24 rounded-md object-cover" src={product.image_urls?.[0] || fallbackImage} alt={product.name} />
                  <div>
                    <h3 className="font-black">{product.name}</h3>
                    <p className="text-sm text-stone-500">{formatPrice(product.price)} · stock {product.stock}</p>
                    <p className="mt-1 text-sm">{product.featured ? 'Destacado' : 'Catalogo'}</p>
                  </div>
                  <div className="flex gap-2 md:flex-col">
                    <button className="icon-button" onClick={() => editProduct(product)} title="Editar"><Edit size={18} /></button>
                    <button className="icon-button text-red-600" onClick={() => deleteProduct(product.id)} title="Eliminar"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Dashboard({ summary }) {
  const cards = [
    ['Productos', summary?.products || 0],
    ['Destacados', summary?.featured || 0],
    ['Sin stock', summary?.outOfStock || 0],
    ['Inventario', summary?.stock || 0]
  ];
  return (
    <section className="panel">
      <h2 className="panel-title"><BarChart3 size={20} /> Dashboard</h2>
      <div className="grid grid-cols-2 gap-3">
        {cards.map(([label, value]) => (
          <div className="rounded-lg bg-stone-100 p-4" key={label}>
            <p className="text-2xl font-black">{value}</p>
            <p className="text-sm text-stone-500">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionTitle({ icon, title }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="rounded-lg bg-amber-100 p-2 text-clay">{icon}</span>
      <h2 className="text-2xl font-black md:text-3xl">{title}</h2>
    </div>
  );
}

const fallbackImage = 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80';
const heroImages = [
  'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
];
const sampleCategories = [
  { id: 'remeras', name: 'Remeras' },
  { id: 'pantalones', name: 'Pantalones' },
  { id: 'camperas', name: 'Camperas' },
  { id: 'zapatillas', name: 'Zapatillas' },
  { id: 'accesorios', name: 'Accesorios' }
];
const sampleProducts = [
  { id: '1', name: 'Remera oversize', description: 'Algodon premium, corte urbano.', price: 18500, stock: 8, sizes: ['S', 'M', 'L'], colors: ['Negro', 'Blanco'], category_id: 'remeras', featured: true, image_urls: [fallbackImage] },
  { id: '2', name: 'Jean recto azul', description: 'Denim resistente para uso diario.', price: 42000, stock: 5, sizes: ['38', '40', '42'], colors: ['Azul'], category_id: 'pantalones', featured: true, image_urls: ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80'] },
  { id: '3', name: 'Campera liviana', description: 'Ideal para noches frescas.', price: 61000, stock: 3, sizes: ['M', 'L', 'XL'], colors: ['Verde', 'Negro'], category_id: 'camperas', featured: false, image_urls: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80'] }
];

createRoot(document.getElementById('root')).render(<App />);
