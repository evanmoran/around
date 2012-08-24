around.js
=============================================================
A prototype-aware AOP library

Motivation
-------------------------------------------------------------
Aspect oriented programming (AOP) is a programming methodology that tries to address
the common issue of similar code being created in several files. This violates the basic DRY
principle, and especially common for operations like logging, profiling, and error handling.

The solution was to create the ability to cut a function before, after, and around it.
This allows you to modify the function without changing it making it more modular and reusable.

Read more on [wikipedia](http://en.wikipedia.org/wiki/Aspect-oriented_programming).

API
-------------------------------------------------------------

around.extend()

    Call this method to extend Function.prototype with
    `around`, `before`, and `after` methods

fn.around(fnBefore, fnAfter)

    Return a function that cuts before and after the function
    being extended.

    fn            The function being extended
    fnBefore      The function called before fn
    fnAfter       The function called after fn

fn.before(fnBefore)

    Return a function that cuts before the function being extended.

    fn            The function being extended
    fnBefore      The function called before fn

fn.after(_fnAfter_)

    Return a function that cuts after the function being extended.

    fn            The function being extended
    fnBefore      The function called before fn
    fnAfter       The function called after fn

Examples
-------------------------------------------------------------

