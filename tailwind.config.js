const sf = ['-apple-system','BlinkMacSystemFont','"SF Pro Text"','"SF Pro Display"','Inter','system-ui','sans-serif']
export default { content: ['./index.html','./src/**/*.{ts,tsx}'],
 theme:{extend:{colors:{brand:{DEFAULT:'#0071e3',soft:'#e8f2fd'},ink:'#1d1d1f',azul:'#0071e3'},
 fontFamily:{sans:sf,display:sf},
 boxShadow:{card:'0 0 0 1px rgba(0,0,0,.04),0 2px 12px rgba(0,0,0,.04)',lift:'0 12px 36px -8px rgba(0,0,0,.18)'}}}}
