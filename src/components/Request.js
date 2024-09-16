import { explainer, actress } from "@infu/icblast"
import { useBlast } from "../icblast"
import { IDL } from "@dfinity/candid";

import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl, FormLabel, Box, Text, Flex, Spacer, Tooltip,
    Input, Button, useDisclosure, Select, HStack, Checkbox, Stack, Alert, AlertIcon, IconButton, useToast, FormErrorMessage
} from '@chakra-ui/react'

import React, { useState, useEffect } from 'react'
import { toState } from "@infu/icblast";
import { setFormTarget } from "../reducers/nodes"
import { Formik, Form, Field, useFormikContext, FieldArray } from 'formik';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import { useDispatch, useSelector } from "react-redux"

import _ from 'lodash';

function Span({ children }) { return <span>{children}</span>; }

export function CreateRequest({ onClose, onSubmit, factory, type_id }) {

    const blast = useBlast();
    const dispatch = useDispatch();
    const toast = useToast();
    const toastIdRef = React.useRef();

    const initialData = useSelector(s => s.nodes.defaults?.[factory]?.[type_id]);

    useEffect(() => {
        dispatch(setFormTarget({ factory, type_id }));
    }, [factory, type_id]);
    return <Box bg="gray.800">

        {initialData ? <Formik
            initialValues={{
                "root": initialData
            }}
            validate={values => {
                //  const errors = {};
                //  if (!values.email) {
                //    errors.email = 'Required';
                //  } else if (
                //    !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
                //  ) {
                //    errors.email = 'Invalid email address';
                //  }
                //  return errors;
            }}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
                try {
                    await onSubmit(values.root);
                    onClose();
                } catch (e) {
                    let [f, err] = convertError(e)
                    console.log({ f, err })
                    setFieldError(f, err);
                }
                setSubmitting(false);

            }}
        >
            <Form>
                <Request factory={factory} type_id={type_id} />
                <SubmitButton />
                <Button ml="4" onClick={onClose}>Cancel</Button>
            </Form>
        </Formik> : null}
    </Box>

}



function SubmitButton() {
    const { isSubmitting } = useFormikContext(); // Access Formik's isSubmitting state

    return (
        <Button
            colorScheme="teal"
            type="submit"
            isLoading={isSubmitting}  // Show spinner when submitting
            loadingText="Submitting"  // Text to show when loading
        >
            Create
        </Button>
    );
}



export function Request({ factory, type_id }) {
    let blast = useBlast();
    let [exp, setExp] = useState(false);
    const load = async () => {
        let actor = await blast.ic(factory);
        let exp = explainer(actor.$idlFactory)
        setExp(exp);
    }


    useEffect(() => {
        load()
    }, [blast, factory, type_id]);



    return <div>{exp ? <QueryBuilder obj={exp.icrc55_create_node.input[1].val[type_id]} /> : null}</div>
}

export function SupportedLedgers() {
    let { factory, type_id } = useSelector(s => s.nodes.formtarget);
    let factories = useSelector(s => s.nodes.factories);
    let ledgers = useSelector(s => s.nodes.ledgers);

    if (!factory || !type_id) return null;
    const supported_ledgers = factories
        .find(([cid]) => cid === factory)?.[1].nodes
        .find(v => v.id === type_id).supported_ledgers;


    return supported_ledgers.map((ledger, idx) => {
        const platform = Object.keys(ledger)[0];
        let ledger_id = ledger[platform];
        return <option key={idx} value={toState(ledger.ic)}>{ledgers.ic[ledger_id].symbol} : {ledger_id}</option>
    })

}

const clsToName = [
    [actress.xText, "Text"],
    [actress.xBigInt, "BigInt"],
    [actress.xNull, "null"],
    [actress.xPrincipal, "Principal"],
    [actress.xNat8, "Nat8"],
    [actress.xNat16, "Nat16"],
    [actress.xNat32, "Nat32"],
    [actress.xNat64, "Nat64"],
    [actress.xInt8, "Int8"],
    [actress.xInt16, "Int16"],
    [actress.xInt32, "Int32"],
    [actress.xInt64, "Int64"],
    [actress.xNat, "Nat"],
    [actress.xInt, "Int"],
    [actress.xTime, "Time"],
    [actress.xFloat, "Float"],
    [actress.xBool, "Bool"],
];

const Method = ({ k, tree }) => {
    const refInput = React.useRef(null);

    return (
        <Box>

            <span ref={refInput}>
                {k}
                <QueryBuilder obj={tree[k].input} />
            </span>

        </Box>
    );
};

export const IDLExplorer = ({ tree }) => {
    let [expanded, setExpanded] = useState({});
    return (
        <Box>
            {Object.keys(tree).map((k, idx) => {
                return (
                    <Method
                        key={idx}
                        k={k}
                        expanded={expanded[k]}
                        setExpanded={setExpanded}
                        tree={tree}
                    />
                );
            })}
        </Box>
    );
};

export const QueryBuilder = ({ obj }) => {
    return (
        <Span>
            <Val k="func" obj={obj} fname="root" />
        </Span>
    );
};

export const Val = ({ obj, level = 1, depth = 0, fname = "" }) => {
    let [selected, setSelected] = useState(false);
    const { values, setFieldValue } = useFormikContext();
    const borderLeft = level > 1 ? "2px solid" : "";
    const borderColor = "gray.900";

    if (depth > 30) return "...recursion...";
    if (!obj) return <Span>null</Span>;

    let pad = Array(level * 2)
        .fill(" ")
        .join("");

    if (obj instanceof actress.xTuple) {
        return (
            <Box borderLeft={borderLeft} borderColor={borderColor} p="2">
                {obj.val.map((x, idx) => (
                    <Box key={idx}>
                        <Val key={idx} obj={x} level={level + 1} depth={depth + 1} fname={fname + "[" + idx + "]"} />
                    </Box>
                ))}
            </Box>
        );
    }

    //   if (Array.isArray(obj)) {
    //     return (
    //       <Span>
    //         {"(???"}
    //         {obj.map((x, idx) => (
    //           <Box key={idx}>
    //             <Val k={idx} obj={obj[idx]} level={level} depth={depth + 1} fname={fname+"."+idx} />
    //           </Box>
    //         ))}
    //         {")"}
    //       </Span>
    //     );
    //   }
    if (obj instanceof actress.xVec) {

        const vectorValues = _.get(values, fname, []);

        const initializeArray = () => {
            if (!vectorValues) {
                setFieldValue(fname, []); // Dynamically set the field as an empty array
            }
        };

        return (
            <FieldArray name={fname}>
                {({ push, remove }) => (
                    <Box>
                        {/* Render each array item */}
                        {(vectorValues || []).map((_, index) => (
                            <Flex key={index} mb={4} alignItems="center" justifyContent="space-between">
                                <Box flex="1"><Val obj={obj.val} level={level} depth={depth + 1} fname={`${fname}[${index}]`} /></Box>
                                <IconButton
                                    aria-label="Remove item"
                                    icon={<CloseIcon />}
                                    size="xs"
                                    colorScheme="gray"
                                    variant="outline"
                                    onClick={() => remove(index)}
                                />
                            </Flex>
                        ))}

                        {/* Add new item */}
                        <Flex justifyContent="flex-end" mt={4}>
                            <IconButton
                                aria-label="Add item"
                                icon={<AddIcon />}
                                size="xs"
                                colorScheme="green"
                                onClick={() => {
                                    initializeArray(); // Initialize the array if necessary
                                    push(""); // Push an empty string or appropriate default value
                                }}
                            />
                        </Flex>
                    </Box>
                )}
            </FieldArray>
        );
    }


    if (obj instanceof actress.xRecord) {
        return (
            <Box borderLeft={borderLeft} p="2" borderColor={borderColor} mb="2" >
                {Object.keys(obj.val).map((x, idx) => (
                    <Span key={idx}>


                        <Box as="span" className="cfield" fontSize="70%" >{x}</Box>

                        <Val key={x} obj={obj.val[x]} level={level + 1} depth={depth + 1} fname={fname + "." + x} />
                    </Span>
                ))}

            </Box>
        );
    }

    if (obj instanceof actress.xOpt)
        return (
            <Span>
                <Span
                    className="xopt"
                    onClick={() => {
                        setSelected(!selected);
                    }}
                >
                    {selected ? "✓" : "?"}
                </Span>
                {selected ? (
                    <Val obj={obj.val} level={level} depth={depth + 1} fname={fname} />
                ) : null}
            </Span>
        );

    if (obj instanceof actress.xVariant) {
        let my_val = Object.keys(_.get(values, fname))[0];

        return (
            <Box borderLeft={borderLeft} p="2" borderColor={borderColor} mb="2">

                <Select
                    defaultValue={my_val}
                    name={fname}
                    variant="filled"
                    className="xvariant"
                    onChange={(e) => {
                        setFieldValue(fname, { [e.target.value]: "" });
                    }}
                >   {
                        Object.keys(obj.val).map((x, idx) => (
                            <option key={idx} value={x} >
                                {x}
                            </option>
                        ))}
                </Select>
                <Val
                    obj={obj.val[my_val]}
                    level={level}
                    depth={depth + 1}
                    fname={fname + "." + my_val}
                />
            </Box>
        );
    }

    if ("input" in obj) {
        return (
            <Span>
                <Text>{" func ("}</Text>
                <Val obj={obj.input} level={level + 1} depth={depth + 1} />
                <Text>{") => "}</Text>
                <Val obj={obj.output} level={level + 1} depth={depth + 1} />
            </Span>
        );
    }

    const clsName =
        typeof obj === "function"
            ? clsToName.find((x) => x[0] === obj)?.[1] || false
            : false;

    if (clsName) {
        if (clsName == "Principal") {
            let my_val = _.get(values, fname);

            return <Box as="span" fontSize="70%" className="ctype" ml="2"><Box as="span" color="gray.600" >
                <Select
                    defaultValue={my_val}
                    name={fname}
                    variant="filled"
                    className="xvariant"
                    onChange={(e) => {
                        setFieldValue(fname, e.target.value);
                    }}
                >   <SupportedLedgers />
                </Select>
            </Box></Box>;
        }

        return <Box as="span" fontSize="70%" className="ctype" ml="2"><Box as="span" color="gray.600" >{clsName}</Box><ChakraFormikInput name={fname} variant="filled" /></Box>;
    };

    console.log("Uncought type", obj, typeof obj);

    return null;
};


const ChakraFormikInput = ({ label, name, ...props }) => {
    return (
        <Field name={name}>
            {({ field, form }) => (
                <FormControl isInvalid={_.get(form.errors, name)}>
                    {label && <FormLabel htmlFor={name}>{label}</FormLabel>}
                    <Input {...field} id={name} variant="filled" {...props} />
                    <FormErrorMessage>{_.get(form.errors, name)}</FormErrorMessage>
                </FormControl>
            )}
        </Field>
    );
};


function convertError(errorString) {
    // Split the error string into two parts: the path and the error message
    const [path, message] = errorString.split(': ');

    // Remove the last ".something" (Error, SyntaxError, etc.) from the path
    const fieldPath = path.replace(/\.[^.]+$/, '');  // Remove the last .Error, .SyntaxError, etc.

    // Replace "arg1." with "root." (or handle other root replacements if needed)
    const intermediatePath = fieldPath.replace(/^arg1\.[^.]+/, 'root');

    // Convert all digits (e.g., .123) to array-like accessors (e.g., [123])
    const finalPath = intermediatePath; //.replace(/\.(\d+)/g, '[$1]');  // Converts .123 to [123]

    // Return the final path and message
    return [finalPath, message];
}
