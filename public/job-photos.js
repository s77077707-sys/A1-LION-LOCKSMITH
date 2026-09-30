(()=>{
const path=location.pathname.replace(/\/+$/,"")||"/";
if(path!=="/")return;
if(document.querySelector(".job-photos"))return;
const files=[
  {jpg:"/media/job-photo-1.jpg",svg:"/media/job-photo-1.svg",alt:"A-1 Lion Locksmith with a customer after car key service in Charlotte",caption:"Car key service completed for a Charlotte customer."},
  {jpg:"/media/job-photo-2.jpg",svg:"/media/job-photo-2.svg",alt:"A-1 Lion Locksmith with a customer holding a new programmed car remote",caption:"New remote programmed on-site."}
];
const host=document.createElement("section");
host.className="section job-photos";
host.innerHTML='<div class="container"><div class="section-heading"><div><p class="overline">Real calls</p><h2>On the job in Charlotte.</h2></div><p>Licensed locksmith work after car key and lockout service. NC License #2313.</p></div><div class="job-photo-grid"></div></div>';
const style=document.createElement("style");
style.textContent=".job-photos{padding:64px 0;display:block;position:relative;z-index:1;clear:both}.job-photos .container{max-width:1120px;margin:0 auto;padding:0 24px}.job-photo-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:24px}.job-photo-grid figure{margin:0}.job-photo-grid img{width:100%;height:420px;object-fit:cover;border-radius:16px;border:1px solid #ffffff24;background:#2a2c28}.job-photo-grid figcaption{margin-top:10px;color:#b8bab5;font-size:14px}@media(max-width:700px){.job-photo-grid{grid-template-columns:1fr}.job-photo-grid img{height:300px}}";
document.head.appendChild(style);
const grid=host.querySelector(".job-photo-grid");
const contact=document.querySelector("#contact,.section.contact");
const footer=document.querySelector(".site-footer,footer");
if(contact)contact.insertAdjacentElement("beforebegin",host);
else if(footer)footer.insertAdjacentElement("beforebegin",host);
files.forEach(item=>{
  const img=document.createElement("img");
  img.alt=item.alt;
  img.loading="lazy";
  img.src=item.jpg+"?v=20260929k";
  img.addEventListener("error",()=>{
    if(img.dataset.tried==="svg")return;
    img.dataset.tried="svg";
    img.src=item.svg+"?v=20260929k";
  },{once:false});
  const fig=document.createElement("figure");
  fig.appendChild(img);
  const cap=document.createElement("figcaption");
  cap.textContent=item.caption;
  fig.appendChild(cap);
  grid.appendChild(fig);
});
})();
