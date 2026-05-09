import{r as n,j as e,m as c,e as d,I as u,v as x,M as b,w as i,x as h,y as p}from"./index-cBMhmdv-.js";function y(){const[t,a]=n.useState(""),[r,o]=n.useState(!1),l=async s=>{if(s.preventDefault(),!t||!t.includes("@")){i.error("Please enter a valid email");return}o(!0),await h("Newsletter Subscribe",async()=>{await p.integrations.Core.SendEmail({to:t,from_name:"7%",subject:"Welcome to the 7% Community 🎉",body:`Welcome to 7%!

You're now part of our community of disciplined individuals.

We'll be sending you:
✓ Weekly fitness insights
✓ Community challenges
✓ Motivation to keep you on track
✓ Tips from top performers

No spam. Just discipline.

Best,
The 7% Team`}),i.success("Subscribed! Check your inbox for 7% insights."),a("")},{setLoading:o,onError:m=>{console.error("Newsletter signup failed:",m),i.error("Something went wrong. Please try again.")}})()};return e.jsx("section",{className:"py-24 px-6 bg-zinc-900/30 border-y border-zinc-800",children:e.jsx("div",{className:"max-w-3xl mx-auto text-center",children:e.jsxs(c.div,{initial:{opacity:0,y:20},whileInView:{opacity:1,y:0},viewport:{once:!0},transition:{duration:.6},children:[e.jsx("div",{className:"w-16 h-16 mx-auto mb-6 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center",children:e.jsx(d,{className:"w-8 h-8 text-amber-400"})}),e.jsx("h2",{className:"text-3xl md:text-4xl font-bold text-white mb-4",children:"Join the 7% Community"}),e.jsxs("p",{className:"text-zinc-500 text-lg mb-8",children:["Get weekly insights, challenges, and motivation delivered to your inbox.",e.jsx("br",{className:"hidden md:block"}),"No spam. Just discipline."]}),e.jsxs("form",{onSubmit:l,className:"flex flex-col sm:flex-row gap-3 max-w-md mx-auto",children:[e.jsx(u,{type:"email",placeholder:"Enter your email",value:t,onChange:s=>a(s.target.value),className:"flex-1 h-12 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 rounded-full px-5"}),e.jsx(x,{type:"submit",disabled:r,className:"h-12 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-semibold rounded-full px-8",children:r?"Subscribing...":e.jsxs(e.Fragment,{children:[e.jsx(b,{className:"w-4 h-4 mr-2"})," Subscribe"]})})]}),e.jsx("p",{className:"text-zinc-600 text-xs mt-4",children:"We respect your privacy. Unsubscribe anytime."})]})})})}export{y as default};
