import './symbols.css';

const paths={
  check:'m5 12 4 4L19 6',
  plus:'M12 5v14M5 12h14',
  target:'M12 2v4m0 12v4M2 12h4m12 0h4M7 7h10v10H7z',
  memory:'m12 3 8 9-8 9-8-9zM9 12h6',
  reset:'M4 9a8 8 0 1 1 0 6M4 3v6h6',
  info:'M12 10v7M12 6v1M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
  warning:'M12 3 2 21h20L12 3zM12 9v5M12 17v1',
};
export const symbol=id=>`<svg class="ui-symbol" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="${paths[id]||paths.info}"/></svg>`;
export const apPips=n=>`<span class="ap-pips" role="img" aria-label="행동력 ${n} / 2">${[0,1].map(i=>`<i class="${i<n?'filled':''}" aria-hidden="true"></i>`).join('')}</span>`;
