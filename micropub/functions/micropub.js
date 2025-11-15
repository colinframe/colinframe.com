import { micropub } from '../config'
export default async (request) => micropub.micropubHandler(request)