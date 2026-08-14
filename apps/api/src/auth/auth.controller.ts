import { Body, Controller, Post } from "@nestjs/common";
import { AuthCoreService } from "./auth-core.service.js";
import { SignInDto } from "./dto/signin.dto.js";
import { SignUpDto } from "./dto/signup.dto.js";

@Controller("auth")
export class AuthController {
    constructor(private readonly authCoreService: AuthCoreService) {}

    @Post("signin")
    signIn(@Body() body: SignInDto) {
        return this.authCoreService.signIn(body);
    }

    @Post("signup")
    signUp(@Body() body: SignUpDto) {
        return this.authCoreService.signUp(body);
    }

    @Post("oauth")
    oauth() {
        return this.authCoreService.oauth();
    }
}
