/* Prorédacteurs Académiques : animations, menu, formulaires.
   TODO : brancher l'envoi des formulaires (ex. messagerie de l'hébergeur ou service de formulaires) avant mise en ligne. */
const io=new IntersectionObserver(es=>es.forEach(en=>{if(en.isIntersecting){en.target.classList.add('in');io.unobserve(en.target)}}),{threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

const co=new IntersectionObserver(es=>es.forEach(en=>{if(!en.isIntersecting)return;const el=en.target,max=+el.dataset.count;let s=null;
  const step=t=>{if(!s)s=t;const p=Math.min((t-s)/1400,1);el.textContent=Math.round(max*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(step)};requestAnimationFrame(step);co.unobserve(el)}),{threshold:.6});
document.querySelectorAll('[data-count]').forEach(el=>co.observe(el));

const header=document.querySelector('header');
const par=document.getElementById('parallax');
addEventListener('scroll',()=>{
  if(header)header.classList.toggle('scrolled',scrollY>40);
  if(par&&scrollY<900)par.style.transform=`translateY(${scrollY*0.08}px)`;
},{passive:true});

const menuBtn=document.getElementById('menuBtn');
if(menuBtn)menuBtn.addEventListener('click',()=>document.getElementById('nav').classList.toggle('open'));

document.querySelectorAll('.dd-wrap>a').forEach(a=>a.addEventListener('click',e=>{
  if(matchMedia('(max-width:920px)').matches){e.preventDefault();a.parentElement.classList.toggle('open')}
}));

/* Envoi des demandes.
   FORM_ENDPOINT : adresse d'un service de réception de formulaires, relié à la messagerie de l'agence.
   Tant qu'elle est vide, le formulaire n'envoie rien et l'afficher comme « envoyé » serait trompeur. */
const FORM_ENDPOINT='/api/contact.php';
document.querySelectorAll('form.qf, #quote').forEach(f=>f.addEventListener('submit',async e=>{
  e.preventDefault();
  if(!f.checkValidity()){f.reportValidity();return}
  const m=f.querySelector('.msg')||document.getElementById('ok');
  if(!FORM_ENDPOINT){
    if(m){m.textContent="L'envoi automatique n'est pas encore activé. Écrivez-nous sur WhatsApp au +33 7 57 75 02 32.";m.style.background='#fdecec';m.style.color='#8a1f1f';m.classList.add('show')}
    return;
  }
  try{
    const r=await fetch(FORM_ENDPOINT,{method:'POST',body:new URLSearchParams(new FormData(f)),headers:{Accept:'application/json'}});
    if(!r.ok)throw new Error(r.status);
    const data=await r.json().catch(()=>({ok:true}));
    if(data.ok===false)throw new Error(data.message||'erreur');
    if(m){m.textContent='Merci pour votre demande. Notre équipe a bien reçu vos informations. Nous allons examiner votre besoin et vous contacter afin de vous proposer une solution adaptée.';m.classList.add('show')}
    f.reset();
  }catch(err){
    if(m){m.textContent="Une erreur est survenue. Réessayez ou écrivez-nous sur WhatsApp.";m.style.background='#fdecec';m.style.color='#8a1f1f';m.classList.add('show')}
  }
}));
