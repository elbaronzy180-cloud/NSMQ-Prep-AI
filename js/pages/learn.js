// Learn page: short, plain-language explanations. Pure reading, no network.
// To add a lesson, add another object to LESSONS below.

import { h } from '../dom.js';

const help = {
  title: 'The Learn page',
  body: [
    'Four short lessons on the words you will see on the Training page: tokens, loss, epochs and overfitting.',
    'Each one has a plain explanation and a small example. Read them in any order. Come back whenever a word on the Training page puzzles you.',
  ],
};

const chip = text => h('span', { class: 'chip' }, text);

const LESSONS = [
  {
    title: 'Tokens',
    body: [
      'A model cannot read letters or words the way you do. First, the text is chopped into small pieces called tokens, and each piece gets a number. A token can be a whole word, part of a word, or even one character.',
      'Everything the model reads and writes is a list of tokens. "Write 60 tokens" means "write about 60 small pieces", which is usually a bit under 60 words.',
    ],
    example: ['The word "unbelievable" might become ', chip('un'), chip('believ'), chip('able'), ' — three tokens.'],
  },
  {
    title: 'Loss',
    body: [
      'Loss is a score for how wrong the model is when guessing the next token. A big number means lots of wrong guesses. A small number means better guesses.',
      'Training is the model nudging itself, again and again, to make this number smaller. That is why you want the line on the Training graph to go down.',
    ],
    example: ['Text so far: "The cat sat on the" … a model with low loss guesses ', chip('mat'), ' with confidence. A model with high loss might guess ', chip('purple'), '.'],
  },
  {
    title: 'Epochs',
    body: [
      'One epoch means the model has read the whole training text once, start to finish. Reading it only once is rarely enough, so training usually repeats for several epochs.',
      'Inside an epoch the text is split into many small batches. Each batch is one "step" on the Training page. So an epoch is lots of steps.',
    ],
    example: ['If your text has 1,000 batches, then 1,000 steps is 1 epoch, and 5,000 steps is 5 epochs.'],
  },
  {
    title: 'Overfitting',
    body: [
      'Overfitting is when the model memorises its training text instead of learning the general patterns. Like a student who memorises last year\'s exam answers but cannot answer a new question.',
      'That is why we also measure the validation loss: the score on text the model never trained on. If training loss keeps falling but validation loss starts rising, the model is overfitting. It is time to stop training, or give it more text.',
    ],
    example: ['On the Training graph, look for the dashed line (validation) turning upward while the solid line (training) keeps going down.'],
  },
];

function render(root) {
  root.append(
    h('h1', {}, 'Learn'),
    h('p', { class: 'page-intro' }, 'Four ideas that explain almost everything on the Training page.'),
    ...LESSONS.map(lesson => h('section', { class: 'card lesson' },
      h('h2', {}, lesson.title),
      ...lesson.body.map(text => h('p', {}, text)),
      h('p', { class: 'example' }, h('b', {}, 'Example: '), ...lesson.example),
    )),
  );
}

export default { title: 'Learn', help, render };
