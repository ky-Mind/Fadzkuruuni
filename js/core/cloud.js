/* js/core/cloud.js - Akun Google dan sinkron cloud (Firebase) */
const FBCFG={apiKey:'AIzaSyDBSyWkPR0ZBDDaHuHAfSzPJfdmx_H0hmE',authDomain:'fadzkuruuni-88a8b.firebaseapp.com',projectId:'fadzkuruuni-88a8b',storageBucket:'fadzkuruuni-88a8b.firebasestorage.app',messagingSenderId:'530459763811',appId:'1:530459763811:web:db2a65d6d2e72201544456'};
const cloudOn=()=>!!(FBCFG.apiKey&&FBCFG.projectId);
let FBU=null,FBD=null,cpt=0;
const SYNC=['bm','hist','nm','qa','theme','fs','fl','fi','tr','lt','tas','tt','rnd','az','loc','pay','ft','full'];
const ldjs=src=>new Promise((o,r)=>{const e=document.createElement('script');e.src=src;e.onload=o;e.onerror=r;document.head.append(e)});
async function fbInit(){if(!cloudOn()||window.firebase?.apps?.length)return;try{const b='https://www.gstatic.com/firebasejs/10.12.2/';await ldjs(b+'firebase-app-compat.js');await ldjs(b+'firebase-auth-compat.js');await ldjs(b+'firebase-firestore-compat.js');firebase.initializeApp(FBCFG);FBD=firebase.firestore();firebase.auth().onAuthStateChanged(async u=>{FBU=u;if(u){if(!S.nm&&u.displayName){S.nm=u.displayName.split(' ')[0];save()}await cloudPull()}if($('#cl'))route()})}catch(e){}}
async function cloudPull(){try{const d=await FBD.collection('users').doc(FBU.uid).get();if(d.exists){const r=d.data();if((r.t||0)>(S.ct||0)){SYNC.forEach(k=>{if(r.s&&r.s[k]!==undefined&&r.s[k]!==null)S[k]=r.s[k]});S.ct=r.t;localStorage.fz=JSON.stringify(S);theme()}}else cloudSend()}catch(e){toast('Sinkron gagal. Periksa koneksi.')}}
const cloudSend=async()=>{if(!FBU)return;const s={};SYNC.forEach(k=>s[k]=S[k]??null);const t=Date.now();S.ct=t;localStorage.fz=JSON.stringify(S);try{await FBD.collection('users').doc(FBU.uid).set({s,t})}catch(e){}};
window.cloudPush=()=>{if(!FBU)return;clearTimeout(cpt);cpt=setTimeout(cloudSend,2500)};
cloudOn()&&fbInit();
