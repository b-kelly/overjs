import { Controller, HelperMap } from "../../src/core/controller";

export class TestController extends Controller {
    static helpers: HelperMap = {
        // sets a public value on the instance that we can verify
        setKey(instance: Controller, data: string): void {
            (instance as TestController).key = data;
        },
    }

    // arbitrary public value to verify setKey ran
    key: string | null = null;

    connect(): void {
        this.baseElement.innerHTML = "connected";
    }

    disconnect(): void {
        this.baseElement.innerHTML = "disconnected";
    }
}
