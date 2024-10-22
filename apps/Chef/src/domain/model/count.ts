export class WordCount {
  constructor(public readonly count = 0, public readonly objective = 0) {}

  addWords(nbWords: number): WordCount {
    return new WordCount(this.count + nbWords, this.objective);
  }

  reset() {
    return new WordCount(0, this.objective);
  }
}
