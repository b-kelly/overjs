import { Controller } from "../../src/core/controller";

export class TestController extends Controller {
    connect(): void {
        this.baseElement.innerHTML = "connected";
    }

    disconnect(): void {
        this.baseElement.innerHTML = "disconnected";
    }
}
