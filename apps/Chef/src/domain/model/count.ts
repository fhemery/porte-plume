export class WordCount {
  constructor(
    public readonly count = 0,
    public readonly objective = 0,
    public readonly eventName?: string
  ) {}

  addWords(nbWords: number): WordCount {
    return new WordCount(this.count + nbWords, this.objective, this.eventName);
  }

  reset(): WordCount {
    return new WordCount(0, this.objective, this.eventName);
  }

  setObjective(nbWords: number, eventName?: string): WordCount {
    return new WordCount(this.count, nbWords, eventName);
  }

  setWordCount(nbWords: number): WordCount {
    return new WordCount(nbWords, this.objective, this.eventName);
  }

  getObjectiveRatio(): number {
    return Math.round((this.count / this.objective) * 100);
  }
}
