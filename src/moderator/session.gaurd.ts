import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Observable } from "rxjs";

/*@Injectable()
export class SessionGuard implements CanActivate {
    canActivate(
        context: ExecutionContext,
    ): boolean {
        const request = context.switchToHttp().getRequest();
        console.log(request.session);
        return request.session.email != undefined;
    }
}*/
@Injectable()
export class SessionGuard implements CanActivate {
canActivate(
 context: ExecutionContext,
 ): boolean  {
 const request = context.switchToHttp().getRequest();
return request.session.email !== undefined;
}
}