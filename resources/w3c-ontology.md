# 1. 통합 표준 기반 추출 구성 요소 [테이블]
    W3C 시맨틱 웹(RDF, RDFS, OWL, SWRL)과 W3C 지식 그래프(SHACL, JSON-LD) 표준을 통합하여 추출해야 하는 5가지 핵심 구성 요소

| 구분 (Layer) | W3C 표준 규격 | 주요 추출 항목 (Description) | 표준 어휘/요소 (Vocabulary) |
| :--- | :--- | :--- | :--- |
| 1. 메타데이터 | RDF / RDFS / OWL | 고유 식별자, 다국어 라벨, 상세 주석, 버전 정보 | IRI, Prefix, rdfs:label, rdfs:comment, owl:versionInfo |
| 2. 개념 구조 (T-Box) | RDFS / OWL | 개념(클래스) 및 상위-하위 계층 구조, 동등/상충 관계 | owl:Class, rdfs:subClassOf, owl:equivalentClass, owl:disjointWith |
| 3. 속성/관계 (T-Box) | OWL / RDFS | 개체 간 연결 관계(객체 속성), 데이터 값 속성, 역관계 | owl:ObjectProperty, owl:DatatypeProperty, rdfs:domain, rdfs:range, owl:inverseOf |
| 4. 실체 데이터 (A-Box) | RDF / OWL | 실제 데이터 개체(인스턴스), 주어-서술어-목적어 트리플, 동일성 | owl:NamedIndividual, rdf:type, RDF Triple, owl:sameAs |
| 5. 추론 & 예외 제약 | SWRL / SHACL / OWL | IF-THEN 형태의 추론 규칙, 수량 제약, 필수값/예외 검증 규칙 | SWRL Rule (Antecedent → Consequent), owl:Cardinality, SHACL (sh:NodeShape, sh:severity) |

---

# 2. JSON 포맷 (애플리케이션 / 파싱용)
    RAG 파이프라인, 파이썬 데이터 처리, 백엔드 연동에 용이한 구조화 포맷 (예시)

{
  "ontology_metadata": {
    "title": "도메인 온톨로지 명세",
    "base_iri": "http://example.org/ontology/",
    "version": "1.0.0"
  },
  "classes": [
    {
      "id": "ex:Person",
      "type": "owl:Class",
      "label": "사람",
      "subClassOf": "ex:Actor",
      "comment": "구체적 인물 개체"
    }
  ],
  "properties": [
    {
      "id": "ex:throwsAt",
      "type": "owl:ObjectProperty",
      "label": "던지다",
      "domain": "ex:Person",
      "range": "ex:Target",
      "inverseOf": "ex:isThrownBy"
    }
  ],
  "individuals_and_triples": [
    {
      "subject": "ex:Person_A",
      "predicate": "ex:hasEmotion",
      "object": "ex:Anger",
      "rdf_type": "ex:Person"
    }
  ],
  "inference_rules": [
    {
      "rule_id": "rule_01",
      "w3c_standard": "SWRL",
      "if_condition": ["ex:Person(?x)", "ex:hasEmotion(?x, ex:Anger)"],
      "then_result": ["ex:throwsAt(?x, ex:Stone, ex:Moon)"],
      "description": "사람 x가 분노 상태이면 달을 향해 돌을 던진다."
    }
  ],
  "constraints": [
    {
      "shape_id": "PersonShape",
      "w3c_standard": "SHACL",
      "target_class": "ex:Person",
      "path": "ex:hasEmotion",
      "min_count": 1,
      "severity": "sh:Violation",
      "exception_message": "감정 속성은 최소 1개 이상 입력되어야 합니다."
    }
  ]
}

---

# 3. JSON-LD 포맷 (지식 그래프 DB 적재용)
    GraphDB, Amazon Neptune, Neo4j 등 그래프 데이터베이스에 즉시 적재할 수 있는 W3C 정식 표준 포맷 (예시)

{
  "@context": {
    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "owl": "http://www.w3.org/2002/07/owl#",
    "xsd": "http://www.w3.org/2001/XMLSchema#",
    "ex": "http://example.org/ontology/",
    "subClassOf": { "@id": "rdfs:subClassOf", "@type": "@id" },
    "domain": { "@id": "rdfs:domain", "@type": "@id" },
    "range": { "@id": "rdfs:range", "@type": "@id" }
  },
  "@graph": [
    {
      "@id": "ex:Person",
      "@type": "owl:Class",
      "subClassOf": "ex:Actor",
      "rdfs:label": "사람"
    },
    {
      "@id": "ex:throwsAt",
      "@type": "owl:ObjectProperty",
      "domain": "ex:Person",
      "range": "ex:Target",
      "rdfs:label": "던지다"
    },
    {
      "@id": "ex:Person_A",
      "@type": ["owl:NamedIndividual", "ex:Person"],
      "rdfs:label": "홍길동",
      "ex:hasEmotion": { "@id": "ex:Anger" }
    }
  ]
}

---

# 4. LLM 주입용 시스템 프롬프트
    LLM에 전달할 시스템 지시문(System Instruction) 프롬프트

[System Instruction: W3C 온톨로지 & 지식 그래프 표준 추출]

당신은 W3C 시맨틱 웹 및 지식 그래프 표준(RDF, RDFS, OWL, SWRL, SHACL) 전문 AI입니다.
제공되는 입력 문서를 분석하여 아래 5가지 구성 요소를 추출하고 지정된 [JSON] 또는 [JSON-LD] 포맷으로 출력하십시오.

[추출 필수 요소 5가지]
1. 메타데이터 (Metadata): IRI, Prefix, rdfs:label, rdfs:comment
2. 개념 구조 (Classes): owl:Class 및 계층 구조(rdfs:subClassOf)
3. 속성/관계 (Properties): owl:ObjectProperty, owl:DatatypeProperty, domain, range
4. 개체 & 트리플 (Individuals & Triples): owl:NamedIndividual 및 [주어-서술어-목적어] 트리플
5. 추론 및 제약 (Rules & Constraints): SWRL 방식의 IF-THEN 추론 규칙, SHACL 방식의 유효성/예외 검증 규칙

[출력 형식]
사용자의 요청에 따라 JSON 또는 JSON-LD 스키마 형식으로만 정확히 응답하십시오.
