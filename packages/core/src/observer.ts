export class Observer {
    private internalObserver: MutationObserver;
    private observee: Element;
    private delegates: ObserverDelegates;

    constructor(observee: Element, delegates: ObserverDelegates) {
        this.delegates = delegates;
        this.observee = observee;
        
        this.internalObserver = new MutationObserver(this.mutate.bind(this));        
    }

    connect() {
        this.internalObserver.observe(this.observee, {
            attributes: true,
            childList: true,
            subtree: true
        });
    }

    disconnect() {
        this.internalObserver?.disconnect();
    }

    refresh() {
        this.handleAddedElements(this.delegates.getApplicableElements(this.observee));
    }

    private mutate(mutations: MutationRecord[], observer: MutationObserver) {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                // handle removes first since we could be replacing an element
                this.handleRemovedElements(mutation.removedNodes);
                this.handleAddedElements(mutation.addedNodes);
            }
            else if (mutation.type === 'attributes') {
                this.handleAttributeChange(mutation.target);
            }
        });
    }

    private handleAddedElements(nodes: NodeList | Node[]) {
        nodes.forEach((n: HTMLElement) => {
            this.delegates.additionDelegate(n);
        });
    }

    private handleRemovedElements(nodes: NodeList | Node[]) {
        nodes.forEach((n: HTMLElement) => {
            this.delegates.removalDelegate(n);
        });
    }

    private handleAttributeChange(node: Node) {
        // TODO
    }
}

export type MutationDelegate = (element: HTMLElement) => void;

export interface ObserverDelegates {
    additionDelegate: MutationDelegate;
    removalDelegate: MutationDelegate;
    attributeChangeDelegate: MutationDelegate;
    getApplicableElements: (element: Element) => NodeList;
}