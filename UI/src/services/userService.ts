import api from './api'
import type { UserInfo } from '../types'

// GET /user/v1/getUser
export const getUserInfo = (): Promise<UserInfo> => {
  return api.get('/user/v1/getUser').then((r) => r.data)
}
