import { observable } from 'mobx';

export class WindowStore {
  @observable
  public width = innerWidth;
  @observable
  public height = innerHeight;

  constructor() {
    window.addEventListener('resize', () => {
      this.width = innerWidth;
      this.height = innerHeight;
    });
  }
}
