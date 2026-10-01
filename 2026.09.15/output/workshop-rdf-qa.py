import sys,json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
sys.path.insert(0,str(root/'tmp/rdf-check'))
from rdflib import Graph,Namespace,RDF,OWL
from rdflib.collection import Collection
g=Graph().parse(root/'output/workshop-semantic-export.jsonld',format='json-ld')
o=Namespace('http://admin.go.kr/ontology#');sw=Namespace('http://www.w3.org/2003/11/swrl#')
assert (o.knows,OWL.inverseOf,o.knownBy) in g
assert (o.Agent,OWL.equivalentClass,o.Entity) in g
assert (o.Agent,OWL.disjointWith,o.Org) in g
rules=list(g.subjects(RDF.type,sw.Imp));assert len(rules)==1
assert len(list(Collection(g,g.value(rules[0],sw.body))))==3
assert len(list(Collection(g,g.value(rules[0],sw.head))))==1
assert (o.alice,RDF.type,o.Person) in g
assert g.value(o.bob,o.age).toPython()==0
report={'rdf_triples':len(g),'structured_rules':len(rules),'checks':8,'result':'pass'}
(root/'output/workshop-rdf-qa.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print(json.dumps(report))

