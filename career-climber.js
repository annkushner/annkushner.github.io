(() => {
  const rail = document.getElementById('career-track');
  const ladder = document.getElementById('career-ladder');
  const climber = document.getElementById('career-climber');
  const section = document.getElementById('projects');
  const about = document.getElementById('about');
  const darkSection = document.getElementById('contact');
  if (!rail || !ladder || !climber || !section || !about || !darkSection) return;
  const poses = [...climber.querySelectorAll('.career-pose')];
  const RUNG_COUNT = 9;
  const MOBILE_STEP_COUNT = 7;
  const DESKTOP_STEP_COUNT = 10;
  const stepCount = () => matchMedia('(min-width: 601px)').matches ? DESKTOP_STEP_COUNT : MOBILE_STEP_COUNT;
  const clamp = (x,a,b) => Math.min(b,Math.max(a,x));
  const smoothstep = t => { t=clamp(t,0,1); return t*t*(3-2*t); };
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  for(let i=0;i<RUNG_COUNT;i++) {
    const rung=document.createElement('div');
    rung.className='career-rung';
    rung.style.top=`${(i+.5)*100/RUNG_COUNT}%`;
    ladder.appendChild(rung);
  }
  let target=0, progress=0, frame=0, last=0;
  // Short, damped horizontal impulse when the character changes climbing pose.
  let previousPose = null;
  let shakeStart = -Infinity;
  let shakeDirection = 1;
  const canShake = () => !reducedMotion && matchMedia('(min-width: 601px)').matches;
  function measure() {
    const start=section.getBoundingClientRect().top + scrollY;
    // The black contact section is the visual ending, before the footer.
    const darkTop=darkSection.getBoundingClientRect().top + scrollY;
    // End when the bottom of About reaches the top of the viewport.
    const end=Math.max(start+1,darkTop);
    target=clamp((scrollY-start)/Math.max(1,end-start),0,1);
    // Clip the fixed-height ladder exactly at the top edge of the dark footer.
    // Do not resize the track: resizing would shift the rungs and the climber.
    const remaining=darkTop-scrollY;
    const viewportHeight=rail.getBoundingClientRect().height;
    const clipBottom=clamp(viewportHeight-remaining,0,viewportHeight);
    rail.style.clipPath=`inset(0px 0px ${clipBottom.toFixed(2)}px 0px)`;
    // Fade only as the About bottom approaches the viewport top.
    // Keep the ladder visible through About. Fade only in the final 48px,
    // when the About/Contact boundary is nearly at the viewport top.
    const fade=clamp(remaining/48,0,1);
    const visible=scrollY>=start-1 && fade>0;
    rail.classList.toggle('is-visible',visible);
    // The clip follows the footer boundary; opacity only softens the final exit.
    rail.style.transition='visibility 0s';
    rail.style.opacity=visible ? String(fade) : '0';
    if(!frame) frame=requestAnimationFrame(render);
  }
  function render(time) {
    frame=0;
    const dt=last?Math.min(64,time-last):16.7; last=time;
    // Damp only scroll jitter; reverse immediately when scroll reverses.
    const factor=reducedMotion?1:1-Math.exp(-dt/85);
    progress+=(target-progress)*factor;
    if(Math.abs(target-progress)<0.00003) progress=target;

    const h=rail.clientHeight;
    const w=rail.clientWidth*.82;
    const ih=w*692/354;
    const foot=ih*(672/692);
    const startY=h*(8.5/RUNG_COUNT)-foot;
    // Blonde hair begins at ~97px in the transparent pose asset.
    const endY=-ih*(97/692);
    const travel=smoothstep(progress);
    const steps=stepCount();
    const step=progress*steps;
    const phase=step-Math.floor(step);
    // A tiny bob, always clamped at the top of the viewport.
    const bob=(progress>0 && progress<1) ? Math.sin(Math.PI*phase)*Math.min(3,h*.003) : 0;
    const y=Math.max(endY,startY+(endY-startY)*travel-bob);
    climber.style.transform=`translate3d(-50%,${y.toFixed(2)}px,0)`;

    // Crisp cel animation: one fully opaque pose at any moment.
    // Change poses at fixed points in each step; never crossfade silhouettes.
    const k=Math.min(steps-1,Math.floor(step));
    const active=phase<0.5 ? k % 3 : (k+1) % 3;
    poses.forEach((p,i)=>{
      p.style.opacity=i===active?'1':'0';
    });
    // Do not vibrate on initial load or when the user is not actually moving.
    if (previousPose !== null && active !== previousPose &&
        Math.abs(target-progress)>0.00003 && canShake()) {
      shakeStart=time;
      shakeDirection *= -1;
    }
    previousPose=active;
    const elapsed=time-shakeStart;
    const shaking=canShake() && elapsed>=0 && elapsed<520;
    const offset=shaking
      ? shakeDirection * 0.95 * Math.sin(Math.PI * elapsed / 520) ** 2
      : 0;
    // Transform ONLY the ladder, never the climbing character.
    ladder.style.transform=`translate3d(${offset.toFixed(2)}px,0,0)`;
    if(progress!==target || shaking) frame=requestAnimationFrame(render);
  }
  addEventListener('scroll',measure,{passive:true});
  addEventListener('resize',measure);
  measure();
})();