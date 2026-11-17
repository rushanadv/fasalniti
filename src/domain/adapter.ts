// Production adapters can replace this local acknowledgement boundary.
export async function confirmDemoMutation(){if(!navigator.onLine)throw new Error('offline');await new Promise(r=>setTimeout(r,350));return {confirmed:true,demo:true}}
