export class Queue<T> {
  private _store: T[] = [];

  getElements(index: number): T {
    return this._store[index];
  }

  getStore(): T[] {
    return this._store;
  }

  public push(val: T) {
    this._store.push(val);
  }

  public pop(): T | undefined {
    return this._store.shift();
  }
}
