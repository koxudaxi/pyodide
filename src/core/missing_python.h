#ifndef MISSING_PYTHON_H
#define MISSING_PYTHON_H

#include "Python.h"
//
//typedef struct {
//    uint8_t v;
//} _PyOnceFlag;

//typedef struct _PyArg_Parser {
//    const char *format;
//    const char * const *keywords;
//    const char *fname;
//    const char *custom_msg;
//    _PyOnceFlag once;       /* atomic one-time initialization flag */
//    int is_kwtuple_owned;   /* does this parser own the kwtuple object? */
//    int pos;                /* number of positional-only arguments */
//    int min;                /* minimal number of arguments */
//    int max;                /* maximal number of positional arguments */
//    PyObject *kwtuple;      /* tuple of keyword parameter names */
//    struct _PyArg_Parser *next;
//} _PyArg_Parser;

PyAPI_FUNC(int) _PySet_Update(PyObject *set, PyObject *iterable);
PyAPI_FUNC(PyObject*) _PyList_Extend(PyListObject *self, PyObject *iterable);
static inline int
_PyObject_SetAttrId(PyObject *v, _Py_Identifier *name, PyObject *w)
{
    int result;
    PyObject *oname = _PyUnicode_FromId(name); /* borrowed */
    if (!oname)
        return -1;
    result = PyObject_SetAttr(v, oname, w);
    return result;
}

extern PyObject* _PyObject_CallMethodIdObjArgs(
    PyObject *obj,
    _Py_Identifier *name,
    ...);
int _PyGen_SetStopIterationValue(PyObject *);

PyAPI_FUNC(int) _PyArg_ParseStack(
    PyObject *const *args,
    Py_ssize_t nargs,
    const char *format,
    ...);

PyAPI_FUNC(int) _PyArg_ParseStackAndKeywords(
    PyObject *const *args,
    Py_ssize_t nargs,
    PyObject *kwnames,
    struct _PyArg_Parser *,
    ...);

static inline PyObject *
_PyObject_VectorcallMethodId(
    _Py_Identifier *name, PyObject *const *args,
    size_t nargsf, PyObject *kwnames)
{
    PyObject *oname = _PyUnicode_FromId(name); /* borrowed */
    if (!oname) {
        return _Py_NULL;
    }
    return PyObject_VectorcallMethod(oname, args, nargsf, kwnames);
}

PyAPI_FUNC(int) _PyArg_CheckPositional(const char *, Py_ssize_t,
                                       Py_ssize_t, Py_ssize_t);

PyAPI_FUNC(PyObject*) _PyNumber_Index(PyObject *o);


static inline PyObject *
_PyObject_CallMethodIdNoArgs(PyObject *self, _Py_Identifier *name)
{
    size_t nargsf = 1 | PY_VECTORCALL_ARGUMENTS_OFFSET;
    return _PyObject_VectorcallMethodId(name, &self, nargsf, _Py_NULL);
}

PyObject *
_PyObject_CallMethodIdOneArg(PyObject *self, _Py_Identifier *name, PyObject *arg);

PyAPI_FUNC(int) _PyUnicode_Equal(PyObject *, PyObject *);
extern PyObject* _PyObject_NextNotImplemented(PyObject *);
PyAPI_FUNC(int) _PyGen_FetchStopIterationValue(PyObject **);





#endif
