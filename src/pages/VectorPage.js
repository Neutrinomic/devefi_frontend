import { Box, Button,  
    Grid, GridItem, } from '@chakra-ui/react';
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

import { CreateVector } from "../components/CreateVector";


export function VectorPage() {

    let blast = useBlast();
    let { architect_id, vid } = useParams();

    let vecs = useAsyncInterval(async () => {
        let rez = {};
        for (let pool in blast.pools) {
            let can = blast.pools[pool];
            let dvs = await can.get_architect_vectors({ id: architect_id, start: 0, length: 20 });

            for (let k in dvs.entries) {
                rez[pool + "." + dvs.entries[k][0]] =  dvs.entries[k][1]
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
    let vec = vid? vecs[vid] : null;
    
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
                <Panel maxSize="15">
                    <LeftNav />
                </Panel>
                <PanelResizeHandle className="resizehandle" />
                <Panel>
                    <PanelGroup direction="vertical">
                        <Panel style={{ position: "relative" }}>
                            <ArchitectVectors key={architect_id} vecs={vecs} architect_id={architect_id} current_vid={vid} />
                            {blast.logged?<Box sx={{ position: "absolute", right: "30px", bottom: "18px" }}><CreateVector /></Box>:null}
                        </Panel>
                        <PanelResizeHandle className="resizehandle" />
                        <Panel>
                            {vec != null ? <VectorHistory key={vid} total={vec.total_events} vec={vec} id={vid} /> : null}
                        </Panel>
                    </PanelGroup>
                </Panel>
                <PanelResizeHandle className="resizehandle" />
                <Panel maxSize="35">
                    {vec != null ? <VectorHeader key={vid} id={vid} info={vec} /> : null}
                </Panel>
            </PanelGroup>
        </GridItem>
    </Grid>


}
