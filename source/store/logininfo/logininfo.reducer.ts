import { ILoginInfo, ILoginInfoToken } from './logininfo.types';
import { LOGININFO_INITIAL_STATE } from './logininfo.initial-state';
import { Seq } from 'immutable';

import {
  LOGININFO_SAVE,
  LOGININFO_INIT
} from '../../constants';

export function loginInfoReducer(state: ILoginInfo = LOGININFO_INITIAL_STATE, action): ILoginInfo {
  switch (action.type) {
    case LOGININFO_SAVE:
		let loginInfoTokens = Array<ILoginInfoToken>();
        let i=0;
        action.payload.loginInfos.forEach(loginInfo => {
            loginInfoTokens.push(<ILoginInfoToken>{
                auth_token: loginInfo.auth_token,
                auth_role: loginInfo.auth_role,
                cu_name: loginInfo.cu_name,
                cu_surname: loginInfo.cu_surname,
                cu_fathername: loginInfo.cu_fathername,
                cu_mothername: loginInfo.cu_mothername,
                cu_email: loginInfo.cu_email,
                minedu_username: loginInfo.minedu_username,
                minedu_userpassword: loginInfo.minedu_userpassword,
                lock_capacity: loginInfo.lock_capacity,
                lock_students: loginInfo.lock_students,
                lock_application: loginInfo.lock_application,
                disclaimer_checked: loginInfo.disclaimer_checked
            });
            i++;
        });
        return Seq(loginInfoTokens).map(n => n).toList();

    case LOGININFO_INIT:
        return LOGININFO_INITIAL_STATE;
    default:
        return state;
  }
};
