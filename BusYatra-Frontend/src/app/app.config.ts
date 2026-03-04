import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    
    // UPDATED: Added withInMemoryScrolling to enable smooth fragment scrolling!
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled' })), 
    
    provideHttpClient(),
    provideClientHydration()
  ]
};