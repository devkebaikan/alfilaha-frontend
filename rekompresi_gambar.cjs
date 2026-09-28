// ============================================================================
// REKOMPRESI GAMBAR IN PLACE (tanpa ganti nama, tanpa ganti format)
// Dipakai utk uploads/ dan public/images/. Menjaga path & referensi tetap valid
// sekaligus HD (tidak pernah memperbesar / withoutEnlargement).
// Model:
//   node rekompresi_gambar.cjs uploads            maxSisi=1600
//   node rekompresi_gambar.cjs public/images      maxSisi=1600
// Hanya menulis ulang bila hasil lebih kecil dari file asli.
// ============================================================================
const sharp=require('sharp');
const fs=require('fs');const path=require('path');
const dir=process.argv[2]||'uploads';
const MAX=parseInt(process.argv[3]||'1600',10);
const kb=b=>Math.round(b/1024);
(async()=>{
  const files=fs.readdirSync(dir).filter(f=>/\.(jpe?g|png|webp)$/i.test(f));
  let before=0,after=0,saved=0,noGain=0,rows=[];
  for(const f of files){
    const p=path.join(dir,f);const b0=fs.statSync(p).size;before+=b0;let out;
    try{
      if(/\.png$/i.test(f)) out=await sharp(p).rotate().resize({width:MAX,height:MAX,fit:'inside',withoutEnlargement:true,withoutReduction:true}).png({compressionLevel:9,palette:true}).toBuffer();
      else if(/\.webp$/i.test(f)) out=await sharp(p).rotate().resize({width:MAX,height:MAX,fit:'inside',withoutEnlargement:true,withoutReduction:true}).webp({quality:82}).toBuffer();
      else out=await sharp(p).rotate().resize({width:MAX,height:MAX,fit:'inside',withoutEnlargement:true,withoutReduction:true}).jpeg({quality:82,mozjpeg:true}).toBuffer();
    }catch(e){after+=b0;rows.push({f,b:kb(b0),a:'ERR',note:e.message});continue;}
    if(!out||out.length>=b0){after+=b0;noGain++;rows.push({f,b:kb(b0),a:kb(b0),note:'no-gain'});continue;}
    fs.writeFileSync(p,out);after+=out.length;saved++;rows.push({f,b:kb(b0),a:kb(out.length),note:'-'+Math.round((1-out.length/b0)*100)+'%'});
  }
  rows.forEach(r=>console.log([r.f,r.b+'KB',r.a+'KB',r.note||''].join('\t')));
  console.log('\nTOTAL',files.length,'file | rewrite:',saved,'no-gain:',noGain);
  console.log('SEBELUM:',(before/1024/1024).toFixed(2)+' MB -> SESUDAH:',(after/1024/1024).toFixed(2)+' MB | hemat',(100-100*after/before).toFixed(1)+'%');
})();
