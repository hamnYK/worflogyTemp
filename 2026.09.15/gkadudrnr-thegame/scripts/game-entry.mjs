// The source HTML is also a file:// launcher. Vite replaces that launcher
// with the module entry only when serving or building the application.
export function gameEntry(){
 return {
  name:'game-entry',
  transformIndexHtml:{order:'pre',handler(html){
   return html.replace(/<script id="local-launcher">[\s\S]*?<\/script>/,'<script type="module" src="/src/main.js"></script>');
  }},
 };
}
