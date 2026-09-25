/* Existing worflogy.com GA4 property. Keep local and preview traffic out. */
(()=>{
 'use strict';
 const measurementId='G-WN1V0G6RJ0';
 if(location.protocol!=='https:'||!['www.worflogy.com','worflogy.com'].includes(location.hostname))return;
 if(document.getElementById('worflogy-ga4-tag'))return;
 window.dataLayer=window.dataLayer||[];
 window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
 window.gtag('js',new Date());
 window.gtag('config',measurementId);
 const tag=document.createElement('script');
 tag.id='worflogy-ga4-tag';tag.async=true;
 tag.src='https://www.googletagmanager.com/gtag/js?id='+measurementId;
 document.head.append(tag);
})();
