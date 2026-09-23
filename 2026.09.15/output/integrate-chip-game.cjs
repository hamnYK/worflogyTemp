const fs=require('fs');
let s=fs.readFileSync('js/coin-arcade.js','utf8');
s=s.replace("const W=900,H=560,R=19;","let gameHandle=null,gameGeneration=0;\nfunction stopGame(){gameGeneration++;gameHandle?.dispose();gameHandle=null;}");
s=s.replace("closing=true;clearTimeout(doorTimer);","closing=true;stopGame();clearTimeout(doorTimer);");
s=s.replace("dialog.addEventListener('close',()=>{","dialog.addEventListener('close',()=>{stopGame();");
s=s.replace("function lobby(){","function lobby(){\n stopGame();");
s=s.replaceAll('3 COINS FOOTBALL','3 CHIPS FOOTBALL').replaceAll('1 COIN BASKETBALL','1 CHIP BASKETBALL');
s=s.slice(0,s.indexOf('function start(){'))+`
async function start(){
 stopGame();const generation=gameGeneration;
 const host=dialog.querySelector('.arcade-content');
 host.innerHTML='<p class="arcade-loading" role="status">'+t('3D 경기장을 준비하고 있습니다.','Preparing the 3D table.')+'</p>';
 try{
 const {mountFootball}=await import('./chip-football.mjs');
 if(generation!==gameGeneration||!dialog.open||closing)return;
 gameHandle=mountFootball(host,{onExit:lobby,onWin:lobby,english:en()});
 }catch(error){
 if(generation!==gameGeneration||!dialog.open||closing)return;
 host.innerHTML='<p>'+t('3D 경기장을 불러오지 못했습니다.','Could not load the 3D table.')+'</p><button type="button" class="wf-button">BACK</button>';
 host.querySelector('button').onclick=lobby;console.error(error);
 }
}
})();
`;
fs.writeFileSync('js/coin-arcade.js',s);