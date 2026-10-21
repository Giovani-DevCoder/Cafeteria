/* ---------- 1. Datos de productos      */
const products = [
  {n:"Latte helado de caramelo", d:"Espresso suave con caramelo y leche fría.", p:1.5, src:"./img/latteHelado.jpg"},
  {n:"Cappuccino",               d:"Clásico, con espuma cremosa y sabor intenso.", p:1.0, src:"./img/cappuccino.jpg"},
  {n:"Mocha",                    d:"Espresso con chocolate y leche vaporizada.", p:1.8, src:"./img/mocha.jpg"},
  {n:"Espresso",                 d:"Fuerte, intenso y puro. Un solo trago.", p:1.0, src:"./img/espresso.jpg"},
  {n:"Cold brew",                d:"Infusión en frío durante 18 horas.", p:2.4, src:"./img/coldBrew.jpg"},
  {n:"Café con leche",           d:"Como en casa: cremoso y reconfortante.", p:1.5, src:"./img/cafeConLeche.jpg"},
];

const $ = id => document.getElementById(id);
const money = n => "$" + n.toFixed(2);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- 2. Imágenes ---------- */
function applyImages(root = document){
  root.querySelectorAll(".slot").forEach(s => {
    const src = (s.dataset.src || "").trim();
    if (src){ s.style.backgroundImage = `url("${src}")`; s.classList.add("ok"); }
  });
}

/* ---------- 3. Tarjetas de productos ---------- */
$("track").innerHTML = products.map((x, i) => `
  <article class="card">
    <div class="slot" data-src="${x.src}" data-label="IMAGEN DEL PRODUCTO\n800 × 1000 px"></div>
    <h3>${x.n}</h3><p>${x.d}</p>
    <div class="row"><span class="price">${money(x.p)}</span>
      <button class="add" data-i="${i}" aria-label="Agregar ${x.n}"><svg class="i"><use href="#cart"/></svg></button>
    </div>
  </article>`).join("");
applyImages();

/* ---------- 4. Aviso (toast) ---------- */
let toastTimer;
function toast(msg){
  const t = $("toast");
  t.textContent = msg; t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("on"), 2000);
}

/* ---------- 5. Pedido ---------- */
const KEY = "amanecer-pedido";
let cart = {};
try { cart = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (_) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(cart)); } catch (_) {} };

function renderCart(){
  const ids = Object.keys(cart).filter(i => products[i]);
  const qty = ids.reduce((a, i) => a + cart[i], 0);
  const sum = ids.reduce((a, i) => a + cart[i] * products[i].p, 0);
  $("count").textContent = qty;
  $("total").textContent = money(sum);
  $("checkout").disabled = $("clear").hidden = !qty;
  $("items").innerHTML = qty ? ids.map(i => `
    <li class="line-item">
      <div><b>${products[i].n}</b><small>${money(products[i].p)} c/u</small></div>
      <div class="qty">
        <button data-act="minus" data-i="${i}" aria-label="Quitar uno">−</button>
        <span>${cart[i]}</span>
        <button data-act="plus" data-i="${i}" aria-label="Agregar uno">+</button>
      </div>
    </li>`).join("") : `<li class="empty">Tu pedido está vacío.<br>Agrega algo del menú.</li>`;
}
function change(i, d){
  cart[i] = (cart[i] || 0) + d;
  if (cart[i] <= 0) delete cart[i];
  save(); renderCart();
}
function bump(el){ el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }

$("track").addEventListener("click", e => {
  const b = e.target.closest(".add"); if (!b) return;
  change(b.dataset.i, 1);
  bump($("cartbtn"));
  b.classList.add("done"); setTimeout(() => b.classList.remove("done"), 500);
  toast(products[b.dataset.i].n + " agregado");
});
$("items").addEventListener("click", e => {
  const b = e.target.closest("[data-act]"); if (!b) return;
  change(b.dataset.i, b.dataset.act === "plus" ? 1 : -1);
});
$("clear").onclick = () => { cart = {}; save(); renderCart(); };
$("checkout").onclick = () => {
  cart = {}; save(); renderCart(); closeCart();
  toast("¡Gracias! Pedido recibido (demo)");
};
renderCart();

/* ---------- 6. Panel del pedido ---------- */
function openCart(){
  $("scrim").hidden = false;
  requestAnimationFrame(() => $("scrim").classList.add("on"));
  $("drawer").classList.add("open");
  $("drawer").setAttribute("aria-hidden", "false");
  $("cartbtn").setAttribute("aria-expanded", "true");
  document.body.style.overflow = "hidden";
  $("closeCart").focus();
}
function closeCart(){
  $("scrim").classList.remove("on");
  setTimeout(() => { $("scrim").hidden = true; }, 300);
  $("drawer").classList.remove("open");
  $("drawer").setAttribute("aria-hidden", "true");
  $("cartbtn").setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}
$("cartbtn").onclick = () => { closeMenu(); openCart(); };
$("closeCart").onclick = closeCart;
$("scrim").onclick = closeCart;

/* ---------- 7. Menú móvil ---------- */
function closeMenu(){
  $("menu").classList.remove("open");
  $("burger").setAttribute("aria-expanded", "false");
}
$("burger").onclick = () => {
  const open = $("menu").classList.toggle("open");
  $("burger").setAttribute("aria-expanded", open);
};
$("menu").addEventListener("click", e => { if (e.target.closest("a")) closeMenu(); });

document.addEventListener("keydown", e => {
  if (e.key === "Escape"){ closeCart(); closeMenu(); }
});

/* ---------- 8. Scroll: header, volver arriba, parallax ---------- */
const hero = document.querySelector(".hero .slot");
let ticking = false;
function onScroll(){
  const y = window.scrollY;
  $("header").classList.toggle("scrolled", y > 40);
  $("backtop").classList.toggle("show", y > 600);
  if (hero && !reduceMotion && y < innerHeight) hero.style.setProperty("--py", (y * 0.25) + "px");
  ticking = false;
}
addEventListener("scroll", () => {
  if (!ticking){ requestAnimationFrame(onScroll); ticking = true; }
}, {passive: true});
onScroll();
$("backtop").onclick = () => scrollTo({top: 0, behavior: reduceMotion ? "auto" : "smooth"});

/* ---------- 9. Aparición de secciones al hacer scroll ---------- */
const reveals = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window){
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); } });
  }, {threshold: 0.15});
  reveals.forEach(el => io.observe(el));
} else {
  reveals.forEach(el => el.classList.add("in"));
}

/* ---------- 10. Enlace activo del menú según la sección ---------- */
const links = [...document.querySelectorAll("#menu a[href^='#']")];
const sections = links.map(a => document.querySelector(a.getAttribute("href"))).filter(Boolean);
if ("IntersectionObserver" in window){
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting){
        links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + en.target.id));
      }
    });
  }, {rootMargin: "-45% 0px -50% 0px"});
  sections.forEach(s => spy.observe(s));
}

/* ---------- 11. Carrusel: flechas ---------- */
const track = $("track");
const step = () => track.firstElementChild.getBoundingClientRect().width + 20;
const behavior = reduceMotion ? "auto" : "smooth";
$("prev").onclick = () => track.scrollBy({left: -step(), behavior});
$("next").onclick = () => track.scrollBy({left:  step(), behavior});
function arrows(){
  $("prev").disabled = track.scrollLeft < 4;
  $("next").disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
}
track.addEventListener("scroll", arrows, {passive: true});
addEventListener("resize", arrows);
arrows();

/* ---------- 12. Boletín ---------- */
$("news").addEventListener("submit", e => {
  e.preventDefault();
  e.target.reset();
  toast("¡Gracias por suscribirte!");
});
