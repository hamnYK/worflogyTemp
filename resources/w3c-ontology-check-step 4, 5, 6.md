# validateW3C 3단계 분류 리팩토링 계획

## 원칙

> "이 위반이 있으면 온톨로지/SWRL 규칙이 의미론적으로 동작할 수 없는가?"
> - YES → **errors** (치명) 또는 **warnings** (구조적 위반, AI 피드백)
> - NO  → **infos** (권고, UI 표시만)

---

## 변경 1: `validateW3C` 반환값 확장

```diff
- return { valid: errors.length === 0, errors, warnings };
+ return { valid: errors.length === 0, errors, warnings, infos };
```

함수 첫 줄에 `const infos = [];` 추가.

---

## 변경 2: `type === 'schema'` (Step 4 도메인 온톨로지)

### warnings 유지 (구조적 위반 — AI 피드백 전달)
| 항목 |
|---|
| `[RDF] triples N개 - 최소 8개 권고` |
| `[SWRL] conditions N개 < 2` |
| `[SWRL] then Consequent ∧ 복합 표기` |
| `[SWRL] conditions 혼합 표기` |
| `[SWRL] conditions 인수 ? 형식 위반` |
| `[OWL] exception_rule conditions 술어 미선언` |
| `[SWRL] then dangling variable` |
| `[OWL] property type 유효하지 않음` |
| `[OWL] property domain/range 없음` |
| `[SHACL] path 없음` |
| `[SHACL] path → properties 불일치` |
| `[SHACL] targetClass/domain 불일치` |
| `[OWL] property 중복 이름` |
| `[RDFS] subClassOf dangling reference` |
| `[OWL] triple object dangling reference` |
| `[OWL] triple subject-domain 불일치` |
| `[OWL] triple object-range 불일치` |
| `[RDF] triple 중복` |
| `[OWL] triple predicate 미선언` |
| `[RDF] DatatypeProperty xsd_type 없음` |
| `[OWL] property domain/range → classes dangling` |

### warnings → infos 전환 (권고 — UI 표시만)
| 항목 |
|---|
| `[RDFS] triple source 없음` |
| `[SWRL] rule_id 형식 불일치` |
| `[OWL] legal_basis 없음` |
| `[SWRL] responsible_dept 빈값` |
| `[OWL] ontology_metadata 없음/불완전` |
| `[OWL] class id(IRI) 없음` |
| `[OWL] class type ~ owl:Class가 아님` |
| `[RDFS] class subClassOf 필드 없음` |
| `[RDFS] class comment 없음` |
| `[OWL] classes 배열 없음` |
| `[OWL] properties 배열 없음` |
| `[OWL] property inverseOf 필드 없음` |
| `[RDFS] property comment 없음` |
| `[SHACL] shape_id 없음` |
| `[SHACL] severity 불명확` |
| `[SHACL] exception_message 없음` |
| `[JSON-LD] @context prefix 누락` |

---

## 변경 3: `type === 'upper'` (Step 5 상위 온톨로지)

### warnings 유지 (구조적 위반)
| 항목 |
|---|
| `[RDFS] subclass_mappings 없음` (그룹 내 매핑 없음 — 상위 온톨로지 목적 상실) |
| `[RDFS] mapping domain_class/upper_class 없음` (→ errors 이미) |
| `[RDFS] 고아 참조 (Step4 classes에 없음)` |
| `[OWL] 공통 클래스 누락 (2개 이상 도메인에 있으나 매핑 없음)` |

### warnings → infos 전환 (권고)
| 항목 | 세부 검증 기준 |
|---|---|
| `[JSON-LD] @context 없음/prefix 없음` | `owl`, `rdfs`, `ont` prefix 각각 확인 |
| `[OWL] ontology_metadata 없음/불완전` | ① 존재 여부 ② `base_iri` 필드 ③ `version` 필드 ④ `w3c_standards` 비어있지 않음 ⑤ `w3c_standards` 내용 — `OWL 2 DL` · `RDFS` · `JSON-LD 1.1` 포함 여부 |
| `[OWL] upper_class id(IRI) 없음` | `id` 필드 + `ont:` prefix 확인 |
| `[OWL] upper_class type 없음/owl:Class 아님` | `type` 없음 또는 `owl:Class` 아님 |
| `[RDFS] upper_class description 없음` | `description` 필드 비어있음 |
| `[OWL] upper_class domain_instances 없음` | `domain_instances` 배열 비거나 없음 |
| `[RDFS] upper_class name 영문 시작` | `name` 필드 첫 글자 영문(`/^[A-Za-z]/`) |

---

## 변경 4: `type === 'inference'` (Step 6 추론 규칙)

### warnings 유지 (구조적 위반)
| 항목 |
|---|
| `[SWRL] risk_level 유효하지 않음` (CRITICAL/HIGH/MEDIUM/LOW 외) |
| `[SWRL] condition 복합 조건 없음` (∧ 없음 — 단일 조건) |
| `[SWRL] condition SWRL 변수(?x) 없음` |
| `[SWRL] swrlb dangling variable` |
| `[SWRL] action unbound variable` |
| `[SWRL] action 주체 조직 변수 사용` |
| `[SWRL] cascade_rules 참조 미존재 inference_id` |
| `[SWRL] inference_id 중복` |
| `[OWL] 상위 온톨로지 클래스 미사용` (연계 없음) |
| `[SWRL] conditions_detail threshold/triple 형식 위반` |

### warnings → infos 전환 (권고)
| 항목 |
|---|
| `[SWRL] inference_id 형식 불일치` (INF_NN 권고) |
| `[SWRL] cascade_rules 배열 아님` |
| `[SWRL] business_impact 없음` |
| `[SWRL] cascade_rules 모두 비어 있음` |
| `[SWRL] cascade_rules 가진 규칙 절반 미만` |

---

## 변경 5: `renderW3CValidation` (L7480)

```
errors   → .al-e  빨강  "W3C 위반 N건"     (기존 유지)
warnings → .al-w  오렌지 "W3C 경고 N건"    (텍스트: "권고" → "경고")
infos    → .al-i  파랑  "W3C 권고 N건"     (신규 블록 추가)
valid    → .al-s  초록  "W3C 표준 준수"    (기존 유지)
```

---

## 변경 6: _prevFeedback 단순화 (3곳)

### Step 4 (L10084~L10113)
`_isStructuralViolation` 필터 함수 제거. warnings = 구조적 위반만 담음.
```js
const _structuralItems = [...errors, ...warnings];  // infos 제외
```

### Step 5 (L10302~L10314)
```js
const _fbItems = [...errors, ...warnings, ...(OWL설계issues)];  // infos 제외
```

### Step 6 (L10616~L10626)
```js
const _fbInfItems = [...errors, ...warnings];  // infos 제외
```

---

## 변경 범위 요약

| 변경 | 위치 | 규모 |
|---|---|---|
| validateW3C `infos` 배열 추가 + 분류 적용 | L6979~L7382 | 약 30개 push 변경 |
| renderW3CValidation infos 블록 추가 | L7480~L7512 | +8줄 |
| Step 4 _prevFeedback 단순화 | L10084~L10113 | -15줄 |
| Step 5 _prevUpperFeedback 단순화 | L10302~L10314 | -2줄 |
| Step 6 _prevInfFeedback 단순화 | L10616~L10626 | -2줄 |
