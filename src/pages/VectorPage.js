import {
    Box, Button,
    Grid, GridItem, Stack, useBreakpointValue, HStack, IconButton
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import icblast, { toState } from '@infu/icblast';
import { InternetIdentity } from "@infu/icblast";
import { Link, useParams } from "react-router-dom";
import { VectorHeader } from "../components/Vector"
import { useBlast } from "../icblast";
import { VectorHistory } from "../components/History"
import {
    getPanelElement,
    getPanelGroupElement,
    getResizeHandleElement,
    Panel,
    PanelGroup,
    PanelResizeHandle,
} from "react-resizable-panels";
import { ArchitectVectors } from "../components/ArchitectVectors";
import { useAsyncInterval } from "../hooks/Interval";
import { Nav } from "../components/Nav";

import { LeftNav } from "../components/Nav";

import { NewVector } from "../components/NewVector";
import {AddAccount} from "../components/AddAccount";
import { Designer } from "../components/Designer";
import { UpDownIcon } from '@chakra-ui/icons';

import { useDispatch, useSelector } from 'react-redux';
import {changeCanvasTo, newCanvas} from "../reducers/nodes";
import { ControlPanel} from "../components/ControlPanel"; 

export function VectorPage() {
    const isMobile = useBreakpointValue({ base: true, xl: false });
    let [expanded_canvas, setExpandedCanvas] = useState(false);
    const current_canvas = useSelector(s => s.nodes.current_canvas_id);

    let blast = useBlast();
    let { architect_id, vid } = useParams();

    let vecs = useAsyncInterval(async () => {
        let rez = {};
        for (let pool in blast.pools) {
            let can = blast.pools[pool];
            let dvs = await can.get_architect_vectors({ id: architect_id, start: 0, length: 20 });

            for (let k in dvs.entries) {
                rez[pool + "." + dvs.entries[k][0]] = dvs.entries[k][1]
            }

        }
        return toState(rez);
    }, 5000, [architect_id]);

    // let vec = useAsyncInterval(async () => {
    //     if (!Number.isInteger(vid)) return;
    //     let rez = await blast.dfv.get_vector(vid);
    //     console.log(rez);
    //     return toState(rez);
    // }, 5000, [vid]);

    if (!vecs) return <Box>Loading...</Box>
    let vec = vid ? vecs[vid] : null;


    // if (isMobile) return <Stack>
    //     <Box><LeftNav /></Box>
    //     <Box><ArchitectVectors key={architect_id} vecs={vecs} architect_id={architect_id} current_vid={vid} /></Box>
    //     <Box>{blast.logged ? <Box textAlign="center" ><AddAccount /><AddVector /><NewVector /></Box> : null}</Box>
    //     <Box>{vec != null ? <VectorHeader key={vid} id={vid} info={vec} /> : null}</Box>
    //     <Box>{vec != null ? <VectorHistory key={vid} total={vec.total_events} vec={vec} id={vid} /> : null}</Box>
    // </Stack>;





    return <Grid
        height="100vh"
        width="100vw"
        gridTemplateColumns={"1fr"}
        templateAreas={`"nav" "content"`}
        gridTemplateRows={"36px 1fr"}
    >
        <GridItem><Nav /></GridItem>
        <GridItem className="panelsgrd">

                <PanelGroup direction="horizontal" >
                    {expanded_canvas?null:<Panel maxSize="15">
                        <LeftNav />
                    </Panel>}
                    {expanded_canvas?null:<PanelResizeHandle className="resizehandle" />}
                    <Panel>
                        <PanelGroup direction="vertical">
                            <Panel style={{ position: "relative" }}>
                                <IconButton sx={{ position: "absolute", right: "10px", top: "10px", zIndex: 10 }} onClick={() => setExpandedCanvas(!expanded_canvas)} icon={<UpDownIcon />}  colorScheme={"gray"} />
                                <CanvasSwitch />
                                <Designer key={architect_id+"-"+current_canvas} vecs={vecs} architect_id={architect_id} current_vid={vid} />
                                {blast.logged ? <Box sx={{ position: "absolute", right: "30px", bottom: "18px" }}></Box> : null}
                            </Panel>
                            {/* {expanded_canvas?null:<PanelResizeHandle className="resizehandle" />}
                            {expanded_canvas?null:<Panel>
                                {vec != null ? <VectorHistory key={vid} total={vec.total_events} vec={vec} id={vid} /> : null}
                            </Panel>} */}
                        </PanelGroup>
                    </Panel>
                    {expanded_canvas?null:<PanelResizeHandle className="resizehandle" />}
                    {expanded_canvas?null:<Panel maxSize="45">
                        <ControlPanel />
                        {/* {vec != null ? <VectorHeader key={vid} id={vid} info={vec} /> : null} */}
                    </Panel>}
                </PanelGroup>
        </GridItem>
    </Grid>


}


function CanvasSwitch() {
    let current = useSelector(s => s.nodes.current_canvas_id);
    let max = useSelector(s => s.nodes.next_canvas_id);
    let dispatch = useDispatch();

    return <Box sx={{ position: "absolute", left: "10px", top: "10px", zIndex: 10 }}>
        <HStack>
            {Array.from({ length: max }, (_, i) => i).map(i => <Button variant={current == i?"solid":"outline"} key={i} onClick={() => dispatch(changeCanvasTo(i))}>{i}</Button>)}
            <Button variant="outline" onClick={() => dispatch(newCanvas())}>+</Button>
        </HStack>
    </Box>
}