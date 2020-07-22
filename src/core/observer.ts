export class Observer {
    private internalObserver: MutationObserver;
    private observee: Element;
    private delegates: ObserverDelegates;

    /**
     * Creates a new Observer on the given element
     * @param observee The element to watch for changes
     * @param delegates The delegate functions to call when a change happens
     */
    constructor(observee: Element, delegates: ObserverDelegates) {
        this.delegates = delegates;
        this.observee = observee;

        // create a new mutation observer and have it call `mutate` when a change happens
        this.internalObserver = new MutationObserver(this.mutate.bind(this));
    }

    /**
     * Instructs the observer to start listening to the observee for changes
     */
    connect(): void {
        this.internalObserver.observe(this.observee, {
            attributes: true,
            childList: true,
            subtree: true,
        });
    }

    /**
     * Instructs the observer to stop watching the observee for changes
     */
    disconnect(): void {
        this.internalObserver?.disconnect();
    }

    /**
     * Gathers all applicable elements and reports them as "added" to the delegates.additionDelegate
     */
    refresh(): void {
        this.handleAddedElements(
            this.delegates.getApplicableElements(this.observee)
        );
    }

    /**
     * Handles all dom mutations, sorting by type and ensuring the right delegates get called
     * @param mutations All mutation records reported by the MutationObserver
     * @param observer The MutationObserver that reported the mutations
     */
    private mutate(mutations: MutationRecord[]) {
        mutations.forEach((mutation) => {
            if (mutation.type === "childList") {
                // handle removes first since we could be replacing an element
                this.handleRemovedElements(mutation.removedNodes);
                this.handleAddedElements(mutation.addedNodes);
            } else if (mutation.type === "attributes") {
                this.handleAttributeChange(
                    mutation.target,
                    mutation.attributeName ?? "",
                    mutation.oldValue ?? ""
                );
            }
        });
    }

    /**
     * Fires the additionDelegate for all added elements
     * @param nodes The nodes that were added in the mutation
     */
    private handleAddedElements(nodes: NodeList | Node[]) {
        //TODO filter on applicable elements only?
        nodes.forEach((n: Node) => {
            this.delegates.additionDelegate(n);
        });
    }

    /**
     * Fires the removalDelegate for all removed elements
     * @param nodes The nodes that were removed in the mutation
     */
    private handleRemovedElements(nodes: NodeList | Node[]) {
        //TODO filter on applicable elements only?
        nodes.forEach((n: Node) => {
            this.delegates.removalDelegate(n);
        });
    }

    /**
     * TODO implement
     * @param node
     */
    private handleAttributeChange(
        node: Node,
        attributeName: string,
        oldValue: string
    ) {
        this.delegates.attributeChangeDelegate(
            node as HTMLElement,
            attributeName,
            oldValue
        );
    }
}

/**
 * Describes the shape of a MutationDelegate callback
 */
export type MutationDelegate = (element: Node) => void;

/**
 * Describes the shape of a AttributeMutationDelegate callback
 */
export type AttributeMutationDelegate = (
    element: HTMLElement,
    attributeName: string,
    oldValue: string
) => void;

/**
 * Describes the collection of delegates callbacks needed by an Observer
 */
export interface ObserverDelegates {
    additionDelegate: MutationDelegate;
    removalDelegate: MutationDelegate;
    attributeChangeDelegate: AttributeMutationDelegate;
    getApplicableElements: (element: Element) => NodeList;
}
