import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { PDE_ROLE } from '../constants';

@Injectable()
export default class RegionEduAuthGuard implements CanActivate {

  constructor(private authService: AuthService) {}

  canActivate() {
    return this.authService.isLoggedIn(PDE_ROLE).then(loggedIn => {return loggedIn;}).catch(err => {return false;});
  }
}