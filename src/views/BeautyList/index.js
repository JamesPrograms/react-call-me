import React, {Component} from 'react';
import TabBar from 'components/TabBar'
import {PullToRefresh,ListView} from 'antd-mobile'
import http from 'js/http'
import './index.less'

class BeautyList extends Component {
    constructor(props) {
        super(props);
        const dataSource = new ListView.DataSource({
            rowHasChanged: (row1, row2) => row1 !== row2,
        })
        this.state = {
            dataSource: dataSource.cloneWithRows({}),
            isLoading: false,
            activeMenuIndex: null,
            curMenuId: null,
            curDataList: [],
            homeNavBarData: [],
            pageSize: 20,
            pageNum: 1,
            scrollTop: null,
            totalPage: null,
            allLoaded: false
        }
    }

    /* 上拉加载 */
    onEndReached() {
        this.setState({
            isLoading: true,
            pageNum: this.state.pageNum + 1
        });
      http.post('mapper/list/getHomeData', {
            appId: 1,
            menuId: this.state.curMenuId,
            pageNo: this.state.pageNum,
            pageSize: this.state.pageSize,
            extraOption: {
                noLoading: true
            }
        }).then((res) => {
            // 合并数据，并把请求到的数据添加到列表
          let newDataList = this.state.curDataList.concat(res.dataCollection);
          this.setState({
              isLoading: false,
              curDataList: newDataList,
              dataSource: this.state.dataSource.cloneWithRows(newDataList)
          });
        })
    }

    changeTab(menuId, activeMenuIndex) {
        this.setState({
            pageNum: 1,
            activeMenuIndex: activeMenuIndex,
            curMenuId: menuId
        });
        http.post('mapper/list/getHomeData', {
            appId: 1,
            menuId: menuId,
            pageNo: 1,
            pageSize: this.state.pageSize,
            extraOption: {
                noLoading: true
            }
        }).then((res) => {
            let resData = res.dataCollection;
            // 把请求到的数据添加到列表
            this.setState({
                curDataList: resData,
                dataSource: this.state.dataSource.cloneWithRows(resData)
            });
        })
    }

    pullToRefresh() {
        http.post('mapper/list/getHomeData', {
            appId: 1,
            menuId: this.state.curMenuId,
            pageNo: 1,
            pageSize: this.state.pageSize,
            extraOption: {
                noLoading: true
            }
        }).then((res) => {
            this.setState({
                pageNum: 1,
                dataSource: this.state.dataSource.cloneWithRows(res.dataCollection)
            });
        })
    }

    componentWillMount() {
        http.post('mapper/menu/getHomeList', {
            appId: 1,
        }).then(res => {
            // 获取渲染navbar导航需要的列表数据

            // 因为h5中没有做关注功能，这里筛选出不是关注的数据
            let menuList = res.dataCollection.menuList;
            menuList = menuList.filter((item) => {
                return item.name !== '关注';
            });
            // 显示头部菜单
            this.setState({
                homeNavBarData: menuList
            });
            // 展示第一个顶部导航首页列表
            this.changeTab(menuList[0].id, 0);
        });
    }

    render() {
        let {homeNavBarData, activeMenuIndex} = this.state;
        const row = (rowData, sectionID, rowID) => {
            return (
                <div className="list-item" key={rowID}
                     onClick={() => {this.props.history.push('/beautyListItem',{userId: rowData.userId})}}
                >
                    <div className="cover-part">
                        <img src={rowData.cover}/>
                        <p className={`status 'status-bgc-'+ ${rowData.status}`}></p>
                    </div>
                    <p className="name-grade">
                        <span>{rowData.nickName}</span>
                        <img src={rowData.gradeIcon}/>
                    </p>
                </div>
            )
        };
        return (
            <div>
                <ul className="navBar">
                    {homeNavBarData.map((item, index) =>
                        <li className={activeMenuIndex === index ? 'active' : ''}
                            key={index}
                            onClick={() => this.changeTab(item.id, index)}>{item.name}
                        </li>
                    )}
                </ul>

                <div className="load-more">
                    <ListView
                        useBodyScroll
                        dataSource={this.state.dataSource}
                        renderRow={row}
                        onEndReachedThreshold={20}
                        onEndReached = {this.onEndReached.bind(this)}
                        pullToRefresh={<PullToRefresh
                            onRefresh={this.pullToRefresh.bind(this)}
                        />}
                        renderFooter={() => (this.state.isLoading && <div style={{padding: 10, textAlign: 'center'}}>
                            加载中...
                        </div>)}
                    />
                </div>
                <TabBar/>
            </div>
        );
    }
}

export default BeautyList;
