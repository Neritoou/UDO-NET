/**
 * Generic binary max-heap (priority queue).
 *
 * Used by the feed ranking engine to keep posts ordered by a computed
 * "hot score" without having to re-sort the whole candidate list on
 * every insertion.
 *
 * Complexity:
 * - insert:              O(log n)
 * - extractMax:          O(log n)
 * - peek / size:         O(1)
 * - fromArray (heapify): O(n)
 *
 * Backed by a plain array using the classic binary-heap index formulas:
 * parent(i) = floor((i - 1) / 2), leftChild(i) = 2i + 1, rightChild(i) = 2i + 2.
 */
export class MaxHeap<T> {
    private items: T[] = [];

    /**
     * @param compare Positive if `a` has higher priority than `b`, negative
     * if lower, 0 if equal. Same contract as Array.prototype.sort, but here
     * it defines heap order instead of a final array order.
     */
    constructor(private readonly compare: (a: T, b: T) => number) {}

    get size(): number {
        return this.items.length;
    }

    isEmpty(): boolean {
        return this.items.length === 0;
    }

    /** Highest-priority item without removing it. O(1) */
    peek(): T | undefined {
        return this.items[0];
    }

    /** Inserts a value and restores the heap property. O(log n) */
    insert(value: T): void {
        this.items.push(value);
        this.bubbleUp(this.items.length - 1);
    }

    /** Removes and returns the highest-priority item. O(log n) */
    extractMax(): T | undefined {
        if (this.items.length === 0) return undefined;

        const max = this.items[0];
        const last = this.items.pop()!;

        if (this.items.length > 0) {
        this.items[0] = last;
        this.bubbleDown(0);
        }

        return max;
    }

    /**
     * Builds a heap from an existing array in O(n) total (bottom-up heapify)
     * instead of calling insert() n times, which would cost O(n log n).
     */
    static fromArray<T>(values: T[], compare: (a: T, b: T) => number): MaxHeap<T> {
        const heap = new MaxHeap<T>(compare);
        heap.items = [...values];

        // Only internal nodes (indices 0..n/2 - 1) can violate the heap
        // property after a bulk assignment, so we only need to sink those down.
        for (let i = Math.floor(heap.items.length / 2) - 1; i >= 0; i--) {
        heap.bubbleDown(i);
        }

        return heap;
    }

    private bubbleUp(index: number): void {
        let current = index;

        while (current > 0) {
        const parent = Math.floor((current - 1) / 2);
        if (this.compare(this.items[current], this.items[parent]) <= 0) break;

        this.swap(current, parent);
        current = parent;
        }
    }

    private bubbleDown(index: number): void {
        let current = index;

        while (true) {
        const left = 2 * current + 1;
        const right = 2 * current + 2;
        let largest = current;

        if (left < this.items.length && this.compare(this.items[left], this.items[largest]) > 0) {
            largest = left;
        }
        if (right < this.items.length && this.compare(this.items[right], this.items[largest]) > 0) {
            largest = right;
        }

        if (largest === current) break;

        this.swap(current, largest);
        current = largest;
        }
    }

    private swap(i: number, j: number): void {
        [this.items[i], this.items[j]] = [this.items[j], this.items[i]];
    }
}