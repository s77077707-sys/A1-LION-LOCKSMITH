(()=>{const path=location.pathname.replace(/\/+$/,"")||"/";if(path!=="/")return;
const files=[["/media/job-photo-1.svg","A-1 Lion Locksmith with a customer after car key service in Charlotte","Car key service completed for a Charlotte customer."],["/media/job-photo-2.svg","A-1 Lion Locksmith with a customer holding a new programmed car remote","New remote programmed on-site."]];
const host=document.createElement("section");host.className="section job-photos";
host.innerHTML='<div class="container"><div class="section-heading"><div><p class="overline">Real calls</p><h2>On the job in Charlotte.</h2></div><p>Licensed locksmith work after car key and lockout service. NC License #2313.</p></div><div class="job-photo-grid"></div></div>';
const style=document.createElement("style");style.textContent=".job-photos{padding:64px 0}.job-photo-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:24px}.job-photo-grid img{width:100%;height:420px;object-fit:cover;border-radius:16px;border:1px solid #ffffff24;background:#1a1c1a}.job-photo-grid figcaption{margin-top:10px;color:#b8bab5;font-size:14px}@media(max-width:700px){.job-photo-grid{grid-template-columns:1fr}.job-photo-grid img{height:300px}}";
document.head.appendChild(style);
const grid=host.querySelector(".job-photo-grid");
const reviews=document.querySelector(".reviews,#reviews,.section.reviews");
const contact=document.querySelector("#contact");
const footer=document.querySelector(".site-footer,footer");
if(reviews)reviews.insertAdjacentElement("beforebegin",host);else if(contact)contact.insertAdjacentElement("beforebegin",host);else if(footer)footer.insertAdjacentElement("beforebegin",host);
files.forEach(([url,alt,caption])=>{
  const img=document.createElement("img");img.alt=alt;img.src=url+"?v=20260929h";img.loading="lazy";
  const fig=document.createElement("figure");fig.appendChild(img);
  const cap=document.createElement("figcaption");cap.textContent=caption;fig.appendChild(cap);
  grid.appendChild(fig);
});
})();
