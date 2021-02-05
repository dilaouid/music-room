import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      /* {
        path: 'tracks',
        children: [
          {
            path: '',
            loadChildren: './tracks/tracks.module#TracksPageModule'
          }
        ]
      },
      {
        path: 'events',
        children: [
          {
            path: '',
            loadChildren: './events/events.module#EventsPageModule'
          }
        ]
      },
      {
        path: 'playlists',
        children: [
          {
            path: '',
            loadChildren: './playlists/playlists.module#PlaylistsPageModule'
          }
        ]
      },
      {
        path: 'profile',
        children: [
          {
            path: '',
            loadChildren: './profile/profile.module#ProfilePageModule'
          }
        ]
      }, */
      {
        path: 'playlists',
        loadChildren: () => import('./playlists/playlists.module').then(m => m.PlaylistsPageModule),
        pathMatch: 'full'
      },
      {
        path: 'tracks',
        loadChildren: () => import('./tracks/tracks.module').then( m => m.TracksPageModule),
        pathMatch: 'full'
      },
      {
        path: 'events',
        loadChildren: () => import('./events/events.module').then( m => m.EventsPageModule),
        pathMatch: 'full'
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then( m => m.ProfilePageModule)
      },
      {
        path: '',
        redirectTo: '/tracks',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '',
    redirectTo: '/tracks'
  },
  {
    path: 'login',
    loadChildren: () => import('../login/login.module').then( m => m.LoginPageModule),
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
