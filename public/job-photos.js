(()=>{
const path=location.pathname.replace(/\/+$/,"")||"/";
if(path!=="/")return;
if(document.querySelector(".job-photos,.trust-callout"))return;

const style=document.createElement("style");
style.textContent=`
.trust-callout{padding:42px 0;border-bottom:1px solid #ffffff20;background:#161816}
.trust-callout .container{max-width:1120px;margin:0 auto;padding:0 24px;display:grid;grid-template-columns:minmax(220px,.9fr) minmax(0,1.2fr);gap:28px;align-items:center}
.trust-callout img{width:100%;height:340px;object-fit:cover;border-radius:16px;border:1px solid #ffffff24;display:block;background:#2a2c28}
.trust-callout .overline{color:#e7c16f;text-transform:uppercase;letter-spacing:.18em;font-size:12px;font-weight:800;margin:0 0 10px}
.trust-callout h2{font-size:clamp(28px,3.4vw,42px);line-height:1.15;margin:0 0 14px}
.trust-callout p{color:#c5c7c0;margin:0 0 18px}
.trust-steps{list-style:none;padding:0;margin:0 0 22px}
.trust-steps li{display:flex;gap:12px;margin:10px 0;color:#ecece6}
.trust-steps b{color:#e7c16f;min-width:1.6em}
.trust-callout .btn{display:inline-flex;align-items:center;min-height:48px;padding:12px 20px;border-radius:8px;background:linear-gradient(135deg,#e9c36e,#aa7b28);color:#16130c;font-weight:800;text-decoration:none}
.job-photos{padding:72px 0;display:block;position:relative;z-index:2;clear:both;background:#141614}
.job-photos .container{max-width:1120px;margin:0 auto;padding:0 24px}
.job-photo-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:24px}
.job-photo-grid figure{margin:0}
.job-photo-grid img{width:100%;height:420px;object-fit:cover;border-radius:16px;border:1px solid #ffffff24;background:#2a2c28;display:block}
.job-photo-grid figcaption{margin-top:10px;color:#b8bab5;font-size:14px}
@media(max-width:800px){
  .trust-callout .container,.job-photo-grid{grid-template-columns:1fr}
  .trust-callout img{height:260px}
  .job-photo-grid img{height:300px}
}`;
document.head.appendChild(style);

const callout=document.createElement("section");
callout.className="trust-callout";
callout.innerHTML='<div class="container"><img src="/media/job-photo-1.jpg?v=20260929p" alt="A-1 Lion Locksmith with a Charlotte customer after car key service" width="800" height="600"><div><p class="overline">Licensed in North Carolina</p><h2>See who shows up.</h2><p>A-1 Lion Locksmith, NC License #2313. Call with your address and we confirm availability before rolling out.</p><ol class="trust-steps"><li><b>1</b> Tell us the lock, key, or vehicle and where you are.</li><li><b>2</b> We confirm timing and an estimate.</li><li><b>3</b> Bring ID and proof you are authorized for the job.</li></ol><a class="btn" href="tel:+17048402555">Call (704) 840-2555</a></div></div>';

const gallery=document.createElement("section");
gallery.className="section job-photos";
gallery.id="job-photos";
gallery.innerHTML='<div class="container"><div class="section-heading"><div><p class="overline">Real calls</p><h2>On the job in Charlotte.</h2></div><p>Car key programming and lockout work with customers on site. NC License #2313.</p></div><div class="job-photo-grid"></div></div>';
const grid=gallery.querySelector(".job-photo-grid");
[["/media/job-photo-1.jpg","A-1 Lion Locksmith with a customer after car key service in Charlotte","Car key service completed for a Charlotte customer."],["/media/job-photo-2.jpg","A-1 Lion Locksmith with a customer holding a new programmed car remote","New remote programmed on-site."]].forEach(([src,alt,caption])=>{
  const img=document.createElement("img");
  img.src=src+"?v=20260929p";
  img.alt=alt;
  img.width=800;
  img.height=600;
  img.loading="lazy";
  img.decoding="async";
  const fig=document.createElement("figure");
  fig.appendChild(img);
  const cap=document.createElement("figcaption");
  cap.textContent=caption;
  fig.appendChild(cap);
  grid.appendChild(fig);
});

const proof=document.querySelector(".proof");
const services=document.querySelector(".services,#services");
const contact=document.querySelector("#contact,.section.contact");
const footer=document.querySelector(".site-footer,footer");
if(proof)proof.insertAdjacentElement("afterend",callout);
else if(services)services.insertAdjacentElement("beforebegin",callout);
if(services)services.insertAdjacentElement("afterend",gallery);
else if(contact)contact.insertAdjacentElement("beforebegin",gallery);
else if(footer)footer.insertAdjacentElement("beforebegin",gallery);
})();
