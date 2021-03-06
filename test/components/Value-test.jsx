import React from 'react';
import { Value } from '../../src/';
import { mount } from 'enzyme';
import { mockPromise, update, setProps, timers } from '../util';
import data from '@solid/query-ldflex';
import auth from 'solid-auth-client';

jest.useFakeTimers();

describe('A Value', () => {
  describe('without expression', () => {
    let field;
    beforeEach(async () => {
      field = mount(<Value/>);
      await update(field);
    });
    afterEach(() => field.unmount());

    it('is the empty string', () => {
      expect(field.find('span')).toHaveLength(0);
      expect(field.text()).toBe('');
    });
  });

  describe('with a string expression', () => {
    let field, expression;
    beforeEach(async () => {
      expression = mockPromise();
      data.resolve.mockReturnValue(expression);
      field = mount(<Value src="user.firstname"/>);
      await timers(field);
    });
    afterEach(() => field.unmount());
    const span = () => field.find('span').first();

    describe('before the expression is evaluated', () => {
      it('is an empty span', () => {
        expect(span().name()).toBe('span');
        expect(span().text()).toBe('');
      });

      it('has the solid class', () => {
        expect(span().hasClass('solid')).toBe(true);
      });

      it('has the value class', () => {
        expect(span().hasClass('value')).toBe(true);
      });

      it('has the pending class', () => {
        expect(span().hasClass('pending')).toBe(true);
      });

      it('starts resolving the expression', () => {
        expect(data.resolve).toBeCalledTimes(1);
      });
    });

    describe('after the expression is evaluated', () => {
      beforeEach(async () => {
        await expression.resolve({ toString: () => 'contents' });
        await update(field);
      });

      it('contains the resolved contents', () => {
        expect(field.text()).toBe('contents');
      });
    });

    describe('after the expression evaluates to undefined', () => {
      beforeEach(async () => {
        await expression.resolve(undefined);
        await update(field);
      });

      it('is an empty span', () => {
        expect(span().name()).toBe('span');
        expect(span().text()).toBe('');
      });

      it('has the solid class', () => {
        expect(span().hasClass('solid')).toBe(true);
      });

      it('has the value class', () => {
        expect(span().hasClass('value')).toBe(true);
      });

      it('has the empty class', () => {
        expect(span().hasClass('empty')).toBe(true);
      });
    });

    describe('after the expression errors', () => {
      beforeEach(async () => {
        await expression.reject(new Error('the error message'));
        await update(field);
      });

      it('is an empty span', () => {
        expect(span().name()).toBe('span');
        expect(span().text()).toBe('');
      });

      it('has the error message in the data-error attribute', () => {
        expect(span().prop('data-error')).toBe('the error message');
      });

      it('has the solid class', () => {
        expect(span().hasClass('solid')).toBe(true);
      });

      it('has the value class', () => {
        expect(span().hasClass('value')).toBe(true);
      });

      it('has the error class', () => {
        expect(span().hasClass('error')).toBe(true);
      });
    });

    describe('after src changes', () => {
      let newExpression;
      beforeEach(async () => {
        newExpression = mockPromise();
        data.resolve.mockReturnValue(newExpression);
        await setProps(field, { src: 'user.other' });
      });

      describe('before the expression is evaluated', () => {
        it('starts resolving the expression', () => {
          expect(newExpression.then).toBeCalledTimes(1);
        });
      });

      describe('after the expression is evaluated', () => {
        beforeEach(async () => {
          await newExpression.resolve('new contents');
          await update(field);
        });

        it('contains the resolved contents', () => {
          expect(field.text()).toBe('new contents');
        });
      });
    });

    describe('after the user changes', () => {
      beforeEach(() => auth.mockWebId('https://example.org/#me'));

      it('re-evaluates the expression', () => {
        expect(data.resolve).toBeCalledTimes(2);
      });
    });
  });

  describe('with a thenable', () => {
    let field, expression;
    beforeEach(async () => {
      expression = mockPromise();
      field = mount(<Value src={expression}/>);
      await timers(field);
    });
    afterEach(() => field.unmount());

    describe('after the user changes', () => {
      beforeEach(() => auth.mockWebId('https://example.org/#me'));

      it('does not re-evaluate the expression', () => {
        expect(expression.then).toBeCalledTimes(1);
      });
    });
  });

  describe('with a string expression and children', () => {
    let field, expression;
    beforeEach(() => {
      expression = mockPromise();
      data.resolve.mockReturnValue(expression);
      field = mount(<Value src="user.firstname">children</Value>);
    });
    afterEach(() => field.unmount());

    describe('before the expression is evaluated', () => {
      it('renders the children', () => {
        expect(field.text()).toBe('children');
      });
    });

    describe('after the expression is evaluated', () => {
      beforeEach(async () => {
        await expression.resolve({ toString: () => 'contents' });
        await timers(field);
      });

      it('contains the resolved contents', () => {
        expect(field.text()).toBe('contents');
      });
    });

    describe('after the expression evaluates to undefined', () => {
      beforeEach(async () => {
        await expression.resolve(undefined);
        await timers(field);
      });

      it('renders the children', () => {
        expect(field.text()).toBe('children');
      });
    });

    describe('after the expression errors', () => {
      beforeEach(async () => {
        await expression.reject(new Error('the error message'));
        await update(field);
      });

      it('renders the children', () => {
        expect(field.text()).toBe('children');
      });
    });
  });
});
