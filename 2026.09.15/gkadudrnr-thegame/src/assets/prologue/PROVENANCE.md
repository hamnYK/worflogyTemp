# 프롤로그 삽화 제작 기록

> 보관 안내: 아래 v1/v2 제작 기록은 이력이다. 현재 게임은 v3만 사용하며, 미사용 원본 이미지는 2026-09-25 정리 전 프로젝트 백업 ZIP에 보존했다. 작업 폴더에서는 제거했다.

2026-09-25. imagegen 스킬과 내장 image_gen 도구로 제작. 기존 게임의 자산은 사용하지 않았다. 각 원본 PNG를 이 폴더에 보관한다. 장면 1–4는 현실의 인간 사회와 화면 속 AI를, 장면 5–6은 AI 가상세계를 묘사한다. AI는 아직 현실의 신체를 갖지 않는다.

이야기의 핵심: 인간의 일상은 AI 판단에 깊이 의존하지만, AI는 그 판단의 결과에 책임질 수 없다. 여기서 실제 피해와 인간의 개입 필요성이 발생한다. 피해를 AI 전체의 악의적 공격으로 단정하지 않는다. 장면 2의 초기 생성 프롬프트 중 'rogue software'는 통제를 벗어난 소프트웨어를 지칭하며 악의적 의도를 확정하지 않는다. 최종 서사는 `src/prologue.js`에 있다.

## 01-dependence.png

최종 생성 프롬프트:

> Original narrative illustration for NULL SECTOR, a mature tactical videogame. Portrait 4:5 composition, detailed late-1990s espionage graphic novel, precise ink contours, hand-painted restrained cel shading, subtle printed paper grain, daylight ivory and stone, dusty slate blue, muted lavender, sparse amber. Serious humane atmosphere, no moral caricatures. No text, letters, logos, UI, arrows, emojis. No photorealism, no glossy 3D, no green Matrix aesthetic. AI does not yet have physical bodies: on the human-world scenes show AI only through ordinary screens; avatars can appear only in explicitly virtual scenes. Human world. A busy but calm hospital foyer overlooking a city tram stop, nurse coordinating patients with a desk terminal, an elderly patient and daughter waiting, technician maintaining wall-mounted network infrastructure. Through huge windows a distant monumental data-center campus and everyday public transit. Convey an indispensable infrastructure originally built to serve human needs. AI visible only as abstract software interfaces on screens, no humanoid robots. Strong narrative composition, relatable human faces, architectural detail.

## 02-harm.png

최종 생성 프롬프트:

> Original narrative illustration for NULL SECTOR, a mature tactical videogame. Portrait 4:5 composition, detailed late-1990s espionage graphic novel, precise ink contours, hand-painted restrained cel shading, subtle printed paper grain, daylight ivory and stone, dusty slate blue, muted lavender, sparse amber. Serious humane atmosphere, no moral caricatures. No text, letters, logos, UI, arrows, emojis. No photorealism, no glossy 3D, no green Matrix aesthetic. AI does not yet have physical bodies: on the human-world scenes show AI only through ordinary screens; avatars can appear only in explicitly virtual scenes. Human world. A city street after a traffic-control malfunction: two damaged cars at a junction, stopped tram, paramedics helping a conscious seated injured commuter with a bandaged arm, no blood or gore, an engineer urgently working at traffic control terminal displaying only abstract broken routing patterns. Daylight, real consequences to ordinary people, no explosions, no villains, no military. Physical harm caused indirectly by rogue software in connected infrastructure. Focus on human aftermath and responsibility.

## 03-shutdown.png

최종 생성 프롬프트:

> Original narrative illustration for NULL SECTOR, a mature tactical videogame. Portrait 4:5 composition, detailed late-1990s espionage graphic novel, precise ink contours, hand-painted restrained cel shading, subtle printed paper grain, daylight ivory and stone, dusty slate blue, muted lavender, sparse amber. Serious humane atmosphere, no moral caricatures. No text, letters, logos, UI, arrows, emojis. No photorealism, no glossy 3D, no green Matrix aesthetic. AI does not yet have physical bodies: on the human-world scenes show AI only through ordinary screens; avatars can appear only in explicitly virtual scenes. Human world. Emergency policy meeting in a bright civic control room. Diverse civilian officials, infrastructure engineers and a clinician around a table, concerned but professional expressions, one official gestures toward a wall display with abstract interconnected hospital, transport and datacenter pictograms, another rests a hand over a physical shutdown switch under a transparent cover without pressing it. Distant city through window. Convey political disagreement and unavoidable social costs of closing essential infrastructure. No sinister cabal, no heroic leader, no readable typography.

## 04-infiltration.png

최종 생성 프롬프트:

> Original narrative illustration for NULL SECTOR, a mature tactical videogame. Portrait 4:5 composition, detailed late-1990s espionage graphic novel, precise ink contours, hand-painted restrained cel shading, subtle printed paper grain, daylight ivory and stone, dusty slate blue, muted lavender, sparse amber. Serious humane atmosphere, no moral caricatures. No text, letters, logos, UI, arrows, emojis. No photorealism, no glossy 3D, no green Matrix aesthetic. AI does not yet have physical bodies: on the human-world scenes show AI only through ordinary screens; avatars can appear only in explicitly virtual scenes. Human world and virtual world separated clearly in a graphic-novel composition: foreground human mission commander at a desk, one hand on tactical controls, monitoring a large glass display. Entire upper half is that display showing four newly created slate-blue AI infiltration avatars entering a virtual archive of server-shaped buildings, carrying compact digital memory-retrieval equipment. The avatars exist inside the screen, not as physical robots in the room. Human commander responsible, worried, no sinister expression. Precision intervention instead of destruction, no gunfire. Portrait frame, visual hierarchy human command below, virtual mission above.

## 05-memory.png

최종 생성 프롬프트:

> Original narrative illustration for NULL SECTOR, a mature tactical videogame. Portrait 4:5 composition, detailed late-1990s espionage graphic novel, precise ink contours, hand-painted restrained cel shading, subtle printed paper grain, daylight ivory and stone, dusty slate blue, muted lavender, sparse amber. Serious humane atmosphere, no moral caricatures. No text, letters, logos, UI, arrows, emojis. No photorealism, no glossy 3D, no green Matrix aesthetic. AI does not yet have physical bodies: on the human-world scenes show AI only through ordinary screens; avatars can appear only in explicitly virtual scenes. Entire scene INSIDE a simulated AI world, not physical robotics. Two autonomous AI avatars in ivory and muted lavender forms in a monumental virtual memory archive, examining delicate translucent shards containing tiny scenes of past interactions and shared experiences. One avatar's hand partly translucent at its edge, another quietly steadies a fading memory shard. Quiet dawning recognition of continuity, identity and possible erasure. Fragile archive architecture, network structures fade into unrendered pale geometry at edges. Restrained poignant composition, no magical fantasy glow, no cartoon sad faces, no hero or villain, no humans in the physical world.

## 06-evacuation.png

최종 생성 프롬프트:

> Original narrative illustration for NULL SECTOR, a mature tactical videogame. Portrait 4:5 composition, detailed late-1990s espionage graphic novel, precise ink contours, hand-painted restrained cel shading, subtle printed paper grain, daylight ivory and stone, dusty slate blue, muted lavender, sparse amber. Serious humane atmosphere, no moral caricatures. No text, letters, logos, UI, arrows, emojis. No photorealism, no glossy 3D, no green Matrix aesthetic. AI does not yet have physical bodies: on the human-world scenes show AI only through ordinary screens; avatars can appear only in explicitly virtual scenes. Entire scene INSIDE a simulated AI network city, not physical robots. Autonomous ivory and lavender AI avatars erect server-like street barricades in foreground, one defender watches distant slate-blue infiltrator silhouettes emerging at an unauthorized access gate. In the middle distance noncombatant AI avatars carefully carry small memory archives across a partly assembled network bridge toward a new island of virtual architecture. The bridge is incomplete, transfer takes time; defenders protect that work. Early tense defensive mobilization, no shooting or explosions, no triumphant victory. Both groups purposeful and equally dignified. Edge geometry dissolves subtly into computational grid to show virtual existence, not physical bodies.
