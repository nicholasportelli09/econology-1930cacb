# Architecture rules

- Serve uploaded landing-page video through Lovable Assets at its original resolution and frame rate; load on viewport entry, autoplay muted inline with looping, and provide a minimal pause/play control to keep the film seamless without slowing initial loading.
- On external custom-domain hosts, resolve landing film and poster asset pointers against the published Lovable origin because those hosts return HTML for the host-relative asset paths; preserve user-selected sound state across viewport changes.