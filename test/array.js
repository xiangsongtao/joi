// Load modules

var Lab = require('lab');
var Joi = require('../lib');
var Support = require('./support/meta');


// Declare internals

var internals = {};


// Test shortcuts

var expect = Lab.expect;
var before = Lab.before;
var after = Lab.after;
var describe = Lab.experiment;
var it = Lab.test;
var verifyBehavior = Support.verifyValidatorBehavior;


describe('Types', function () {

    describe('Array', function () {

        var A = Joi.types.Array,
            N = Joi.types.Number,
            S = Joi.types.String,
            O = Joi.types.Object;

        describe('#_convert', function () {

            it('should convert a string to an array', function (done) {

                var result = A()._convert('[1,2,3]');
                expect(result.length).to.equal(3);
                done();
            });

            it('should convert a non-array string to an array', function (done) {

                var result = A()._convert('{ "something": false }');
                expect(result.length).to.equal(1);
                done();
            });

            it('should return a non array', function (done) {

                var result = A()._convert(3);
                expect(result).to.equal(3);
                done();
            });

            it('should convert a non-array string with number type', function (done) {

                var result = A()._convert('3');
                expect(result.length).to.equal(1);
                expect(result[0]).to.equal('3');
                done();
            });

            it('should convert a non-array string', function (done) {

                var result = A()._convert('asdf');
                expect(result).to.equal('asdf');
                done();
            });
        });

        describe('#validate', function () {

            it('should, by default, allow undefined, allow empty array', function (done) {

                verifyBehavior(A(), [
                    [undefined, true],
                    [
                        [],
                        true
                    ]
                ], done);
            });

            it('should, when .required(), deny undefined', function (done) {

                verifyBehavior(A().required(), [
                    [undefined, false]
                ], done);
            });

            it('should allow empty arrays with emptyOk', function (done) {

                verifyBehavior(A().emptyOk(), [
                    [undefined, true],
                    [[], true]
                ], done);
            });

            it('should exclude values when excludes is called', function (done) {

                verifyBehavior(A().excludes(S()), [
                    [['2', '1'], false],
                    [['1'], false],
                    [[2], true]
                ], done);
            });

            it('should allow types to be excluded', function (done) {

                var schema = A().excludes(N());

                var n = [1, 2, 'hippo'];
                var result = schema.validate(n);

                expect(result).to.exist;

                var m = ['x', 'y', 'z'];
                var result2 = schema.validate(m);

                expect(result2).to.not.exist;
                done();
            });

            it('should validate array of Numbers', function (done) {

                verifyBehavior(A().includes(N()), [
                    [
                        [1, 2, 3],
                        true
                    ],
                    [
                        [50, 100, 1000],
                        true
                    ],
                    [
                        ['a', 1, 2],
                        false
                    ]
                ], done);
            });

            it('should validate array of mixed Numbers & Strings', function (done) {

                verifyBehavior(A().includes(N(), S()), [
                    [
                        [1, 2, 3],
                        true
                    ],
                    [
                        [50, 100, 1000],
                        true
                    ],
                    [
                        [1, 'a', 5, 10],
                        true
                    ],
                    [
                        ['joi', 'everydaylowprices', 5000],
                        true
                    ]
                ], done);
            });

            it('should validate array of objects with schema', function (done) {

                verifyBehavior(A().includes(O({ h1: N().required() })), [
                    [
                        [{ h1: 1 }, { h1: 2 }, { h1: 3 }],
                        true
                    ],
                    [
                        [{ h2: 1, h3: 'somestring' }, { h1: 2 }, { h1: 3 }],
                        false
                    ],
                    [
                        [1, 2, [1]],
                        false
                    ]
                ], done);
            });

            it('should not validate array of unallowed mixed types (Array)', function (done) {

                verifyBehavior(A().includes(N()), [
                    [
                        [1, 2, 3],
                        true
                    ],
                    [
                        [1, 2, [1]],
                        false
                    ]
                ], done);
            });

            it('errors on invalid number rule using includes', function (done) {

                var schema = {
                    arr: Joi.types.Array().includes(Joi.types.Number().integer())
                };

                var input = { arr: [1, 2, 2.1] };
                var err = Joi.validate(input, schema);

                expect(err).to.exist;
                expect(err.message).to.equal('the value 2.1 in arr does not match any of the allowed types');
                done();
            });

            it('validates an array within an object', function (done) {

                var schema = Joi.types.Object({
                    array: Joi.types.Array().includes(Joi.types.String().min(5), Joi.types.Number().min(3))
                }).options({ convert: false });

                verifyBehavior(schema, [
                    [{ array: ['12345'] }, true],
                    [{ array: ['1'] }, false],
                    [{ array: [3] }, true],
                    [{ array: ['12345', 3] }, true]
                ], done);
            });
        });
    });
});
