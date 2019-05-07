import { BehaviorSubject } from "rxjs";

export class RightPanelHelper {

    rightPanelState: BehaviorSubject<boolean>;

    constructor() {
        this.rightPanelState = new BehaviorSubject<boolean>(false);
    }

    setOpen() {
        this.rightPanelState.next( true );
    }

    setClosed() {
        this.rightPanelState.next( false );
    }
}