import React, {useEffect, useState} from "react"
import InfiniteScroll from "react-infinite-scroll-component";
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import axios from 'axios'

import 'bootstrap/dist/css/bootstrap.min.css';


import Col  from 'react-bootstrap/Col'
import Row  from 'react-bootstrap/Row'
import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Tooltip from 'react-bootstrap/Tooltip'
import Spinner from 'react-bootstrap/Spinner'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClone, faTrash, faGripVertical, faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons'

const IndexPage = () => {

  const grid = 8;

  const [dataLoader, setDataLoader] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  let [items, setItems] = useState([])
  const [itemBreakPoint, setItemBreakPoint] = useState(100)
  const [totalItems, setTotalItems] = useState(0)
  const [totalItemsData, setTotalItemsData] = useState(0)

  useEffect(() => {
    fetchRuleData()
  }, [])

  async function fetchRuleData() {
    setDataLoader(true)
    axios.get(`https://jivoxdevuploads.s3.amazonaws.com/eam-dev/files/44939/Rule%20JSON.json`)
    .then(res => {
      setTotalItemsData(res.data.data)
      setDataLoader(false)
      setTotalItems(res.data.data.length)
      if (res.data.data.length > 100)
        setItems(res.data.data.slice(0, itemBreakPoint))
      else
        setItems(res.data.data.slice(0, res.data.data.length))
    })
  }

  const fetchMoreData = () => {
    setTimeout(() => {
      let tempItems = totalItemsData

      if (itemBreakPoint < totalItems){

        let temp_array = tempItems.slice(0, itemBreakPoint).concat(tempItems.slice(itemBreakPoint, itemBreakPoint+100))
        
        setItems(temp_array)
        setItemBreakPoint(itemBreakPoint+100)
      }
      else{
        let temp_array = tempItems.slice(0, itemBreakPoint).concat(tempItems.slice(itemBreakPoint, totalItems))
        items.concat(
          temp_array
        )
        setItems(items)
        setHasMore(false)
        setItemBreakPoint(totalItems)
      }
    }, 500);
  };

  function deleteItem(item) {
    const data = items.filter(i => i.id !== item.id)
    setItems(data)
  }

  function cloneItem(index, item) {
    const newItems = items.slice();
    newItems.splice(index, 0, item)
    setItems(newItems)
  }

  function moveItemUp(index, item){
    const tempItems = reorder(
      items, 
      index, 
      index-1
    );
    
    setItems(tempItems);
  }

  function moveItemDown(index, item){
    const tempItems = reorder(
      items, 
      index, 
      index+1
    );
    
    setItems(tempItems);
  }

  const getItemStyle = (draggableStyle, isDragging) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',
    // padding: grid * 2,
    margin: `0 0 ${grid}px 0`,
    
    // change background colour if dragging
    background: isDragging ? 'lightgreen' : 'grey',
    
    // styles we need to apply on draggables
    ...draggableStyle
  });

  const getListStyle = (isDraggingOver) => ({
    background: isDraggingOver ? 'rgb(18, 24, 44)' : '#28324e',
    padding: grid,
    width: '100%'
  });

  const reorder =  (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  function onDragEnd (result) {
    // dropped outside the list
    if(!result.destination) {
      return; 
    }
    
    const tempItems = reorder(
      items, 
      result.source.index, 
      result.destination.index
    );
    
    setItems(tempItems);
  }

  const loadData = () => {
    if (dataLoader){
      return (
        <div className={`m-3 align-self-center d-flex justify-content-center`}>
          <Spinner className='text-center' animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
        </div>
      )
    }else{
      if (items && items.length > 0){
        return (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  {...provided.droppableProps}
                >
                  <InfiniteScroll
                    dataLength={items.length}
                    next={fetchMoreData}
                    hasMore={hasMore}
                    loader={<div className={`m-3 align-self-center d-flex justify-content-center`}>
                      <Spinner className='text-center' animation="border" role="status">
                        <span className="sr-only">Loading...</span>
                      </Spinner>
                    </div>}
                  >
                    {items.map((item, index) => (
                      <Draggable
                        key={`${item.id}-${index}`}
                        draggableId={`${item.id}-${index}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div className={`hover-effect`}>
                            <div
                              ref={provided.innerRef}
                              {...provided.dragHandleProps}
                              {...provided.draggableProps}
                              style={getItemStyle(
                                provided.draggableProps.style,
                                snapshot.isDragging
                              )}
                            >
                              <div className={`d-flex mb-1 py-2`} key={`${index}-${item.id}`} style={{ backgroundColor: `#46537E` }}>
                                <div className={`pl-3 align-self-center`}>
                                  <FontAwesomeIcon className={`drag-hover`} icon={faGripVertical} size="sm" />
                                </div>
                                <div className={`pl-3 align-self-center`} >
                                  <p className={`m-0 font-weight-bold text-white`}>{item.id}</p>
                                  <Col className='p-0'>
                                    <OverlayTrigger
                                      key={`up-${item.id}-${index}`}
                                      placement={'top'}
                                      overlay={
                                        <Tooltip id={`tooltip-clone-${item.id}-${index}`}>
                                          Move Up
                                        </Tooltip>
                                      }
                                    >
                                      <Button className={`ml-0 mr-2 bg-transparent border-0 p-0 ${index===0 ? 'd-none' : ''} `} style={{color: 'rgb(39, 224, 195)'}} onClick={()=>moveItemUp(index, item)} > <FontAwesomeIcon icon={faChevronUp} size="sm" />  </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                      key={`down-${item.id}-${index}`}
                                      placement={'top'}
                                      overlay={
                                        <Tooltip id={`tooltip-clone-${item.id}-${index}`}>
                                          Move Down
                                        </Tooltip>
                                      }
                                    >
                                      <Button className={`ml-0 mr-2 bg-transparent border-0 p-0 ${index===items.length-1 ? 'd-none' : ''} `} style={{color: 'rgb(39, 224, 195)'}} onClick={()=>moveItemDown(index, item)} > <FontAwesomeIcon icon={faChevronDown} size="sm" />  </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                      key={`clone-${item.id}-${index}`}
                                      placement={'top'}
                                      overlay={
                                        <Tooltip id={`tooltip-clone-${item.id}-${index}`}>
                                          Clone
                                        </Tooltip>
                                      }
                                    >
                                      <Button className={`ml-0 mr-2 bg-transparent border-0 p-0`} style={{color: 'rgb(39, 224, 195)'}} onClick={()=>cloneItem(index, item)} > <FontAwesomeIcon icon={faClone} size="sm" />  </Button>
                                    </OverlayTrigger>
                                    <OverlayTrigger
                                      key={`delete-${item.id}-${index}`}
                                      placement={'top'}
                                      overlay={
                                        <Tooltip id={`tooltip-delete-${item.id}-${index}`}>
                                          Delete
                                        </Tooltip>
                                      }
                                    >
                                      <Button className={`ml-0 bg-transparent border-0 p-0`} style={{color: 'rgb(39, 224, 195)'}} onClick={()=>deleteItem(item)} > <FontAwesomeIcon icon={faTrash} size="sm" />  </Button>
                                    </OverlayTrigger>
                                  </Col>
                                </div>
                                <div className={`pl-3 ml-auto mr-3 align-self-center`}>
                                  <p className={`mb-0 font-weight-bold pr-5`} style={{ color: `#C6CFF4` }}>{item.ruleName}</p>
                                </div>
                              </div>
                            </div>
                            {provided.placeholder}
                          </div>
                         )}
                      </Draggable>
                    ))}
                  </InfiniteScroll>
                {provided.placeholder}
                </div>
               )}
            </Droppable>
          </DragDropContext>
        )
      }else{
        <p> No Data found </p>
      }
    }
  }

  return (
    <Row style={{backgroundColor: `rgb(18, 24, 44)`, minHeight: '100vh'}} >
      <Col lg="12" md="12" sm="12" xs="12" className={`text-white px-5`}>
        <h4 className={`mt-3`} >
          <span>Jivox: Rule data</span>
        </h4>
        <div className={`mb-5`} style={{overflow: 'scroll', borderRadius: '15px', backgroundColor: '#28324e'}}>
          <div className={`d-flex p-3`}>
            <div className={`pl-4 align-self-center`} >
              <p className={`m-0 font-weight-bold`} style={{ color: `#C6CFF4` }}>Id</p>
            </div>
            <div className={`pl-3 ml-auto mr-3 align-self-center`}>
              <p className={`m-0 font-weight-bold`} style={{ color: `#C6CFF4` }}>Rulename&nbsp; </p>
            </div>
          </div>
          {loadData()}
        </div>
      </Col>
    </Row>
  );
}

export default IndexPage
