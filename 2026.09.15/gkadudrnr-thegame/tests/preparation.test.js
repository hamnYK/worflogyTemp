import test from 'node:test';
import assert from 'node:assert/strict';
import { newGame, act, chance, outcome, packSave, validateSave } from '../src/rules.js';
import { makeAgents, levelOf, MISSIONS, DEFENSE_TURNS } from '../src/operation.js';

test('equipment changes shot stats and sniper skill requires its weapon',()=>{
  const agents=makeAgents();agents[0].weapon='impact';agents[0].module='relay';
  const s=newGame('human',[0,2,4,5],agents);s.cover.forEach(c=>c.hp=0);s.scanUntil=2;
  const u=s.units[0],e=s.units[4];e.x=7;e.z=2;
  assert.equal(chance(s,u,e),75);
  assert.ok(act(s,'shoot',{id:e.id}).ok);assert.equal(e.hp,3);
  const short=newGame('human',[0,2,4,5],agents);short.cover.forEach(c=>c.hp=0);short.scanUntil=2;short.units[4].x=8;
  assert.equal(act(short,'shoot',{id:'e0'}).ok,false);
  const sniper=newGame('human',[3,0,2,4]);sniper.cover.forEach(c=>c.hp=0);sniper.scanUntil=2;sniper.agents[3].weapon='impact';
  assert.equal(act(sniper,'skill',{id:'e0'}).ok,false);assert.equal(sniper.units[4].hp,8);
});
test('victory advances all seven equally without HP growth; rewards cannot repeat',()=>{
  const s=newGame();const health=s.units.map(u=>u.maxHp);s.carrier='p0';outcome(s);outcome(s);
  assert.equal(s.status,'won');assert.ok(s.agents.every(a=>a.xp===100&&levelOf(a)===2));
  const next=newGame('human',s.roster,s.agents);assert.deepEqual(next.units.map(u=>u.maxHp),health);
  s.agents[0].weapon='mnemonic';assert.deepEqual(validateSave(packSave(s)),s);
});
test('loadout save rejects locked and unknown equipment, migrates original saves',()=>{
  const s=newGame();s.agents[0].weapon='mnemonic';assert.throws(()=>validateSave(packSave(s)));
  s.agents[0].weapon='injected';assert.throws(()=>validateSave(packSave(s)));
  delete s.agents;assert.deepEqual(validateSave(packSave(s)).agents,makeAgents());
  const legacy=newGame('ai');delete legacy.mapVersion;delete legacy.agents;legacy.cover=newGame('human').cover;
  assert.equal(validateSave(packSave(legacy)).mapVersion,1);
});
test('factions have distinct battle layouts and briefing matches defense threshold',()=>{
  const human=newGame('human'),ai=newGame('ai');assert.notDeepEqual(human.cover,ai.cover);
  assert.doesNotThrow(()=>validateSave(packSave(ai)));
  assert.ok(MISSIONS.ai.objectives[0].includes(String(DEFENSE_TURNS)));
  ai.turn=DEFENSE_TURNS;outcome(ai);assert.equal(ai.status,'active');
  ai.turn++;outcome(ai);assert.equal(ai.status,'won');
});
