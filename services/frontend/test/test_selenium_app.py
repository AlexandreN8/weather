from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException, TimeoutException


from selenium.webdriver.common.action_chains import ActionChains
import time

"""
# Next 2 lines are needed to specify the path to your geckodriver
geckodriver_path = "/snap/bin/geckodriver"
driver_service = webdriver.FirefoxService(executable_path=geckodriver_path)

driver = webdriver.Firefox(service=driver_service)"""

# Start the browser""
url_front = "http://localhost:3001/";
# prod env : 
# url_front = os.get


def open_webpage (webpage) : 
        
    driver = webdriver.Firefox()  
    # Open a webpage
    driver.get(webpage)
    driver.maximize_window()
    return driver

#------------- working well ----   issues with simultaneous selenium calls -------   possible to bypass by calling functions independetantly


def test_menu () : 
    try:
        # Open the webpage
        driver = open_webpage(url_front);

        # Find the navigation menu
        menu = driver.find_element(By.TAG_NAME, "nav")
        
        # Find the first link in the navigation menu
        accueil = menu.find_elements(By.XPATH, ".//a")[0]

        
        
        # Example: You might want to print or click the link
        print(accueil.text)
        accueil.click()  # You can perform other actions like clicking on the link


        # -------------- click on carte ---------------------
        menu.find_elements(By.XPATH, ".//a")[1].click(); #imporve this find element

        # Wait for the new page to load (for example, wait for an element that is unique to the new page)
        WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "map")))
        
        # Get the updated current URL after the page has loaded
        current_url = driver.current_url
        
        # Verify that the URL matches the expected one
        expected_url = url_front + "map"
        assert current_url == expected_url, f"Expected URL {expected_url}, but got {current_url}"


    finally:

        time.sleep(4)
    
        # Close the browser window
        driver.quit()


def test_search_bar_not_complete(): 
    driver = open_webpage(url_front+ "map/");
 
    # Locate the search bar using name attribute
    search_box = driver.find_element(By.TAG_NAME, 'input');

    time.sleep(3);

    # Type something in the search box
    search_box.send_keys("C")
    
    # check that list is limited to Batia
    bastia = driver.find_elements(By.TAG_NAME, 'li');
    assert (len(bastia) > 1); 

    time.sleep(3)    
    # Close the browser
    driver.quit()


def test_search_bar_wrong_input () :
    
    driver = open_webpage(url_front+ "map/");
 
    # Locate the search bar using name attribute
    search_box = driver.find_element(By.TAG_NAME, 'input');

    time.sleep(1);

    # Type something wrong in the search box
    search_box.send_keys("tureeri")
    
    # check that list is limited to Batia
    bastia = driver.find_elements(By.TAG_NAME, 'li');
    assert (len(bastia) == 0 );  

    time.sleep(3);

    # Close the browser
    driver.quit()

#------------- WAIT FRONTEND TEAM TO FINISH DATA PRESENTATION -----------------------------
def test_search_bar_choose_station():
    driver = open_webpage(url_front+ "map/");
    
    map = driver.find_element(By.ID, 'map');
    
    try :    
        # Locate the search bar using XPATH : find input with type text 
        search_box = driver.find_element(By.XPATH, "//input[@type='text']");

        station = "Ajaccio";
        # Type a name that should be in the list 
        search_box.send_keys(station)

        # check that list is limited to that name
        list_cities = driver.find_elements(By.XPATH, "//li")
        assert (len(list_cities) == 3); 
        city = driver.find_element(By.XPATH, f"//li[contains(text(), {station})]")
    
        # check station chosen is the only one appearing on the map
        tooltip = map.find_elements(By.CLASS_NAME, "leaflet-marker-icon")
        assert len(tooltip) == 3
        assert tooltip[0].is_displayed()

        # click on map element  
        actions = ActionChains(driver)
        actions.move_to_element(tooltip[0]).perform()
        actions.click().perform(); 
        time.sleep(3)

        # check station graph appears
        try : 
            WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "tempChart")))
        except TimeoutException : 
            raise NoSuchElementException("Element with ID 'tempChart' not found.")

    finally : 
        time.sleep(5);
        
        # Close the browser
        driver.quit()


# def test_map():
#     open_webpage(url_front+ "map/");
    
#     map = driver.find_element(By.ID, 'map');
    
#     try :    
#         # Locate the search bar using name attribute
#         search_box = driver.find_element(By.XPATH, ".//input[@type='text']");

#         # Type something in the search box
#         search_box.send_keys("bastia")

#         # check that list is limited to Bastia
#         bastia = driver.find_elements(By.XPATH, ".//li")
#         assert (len(bastia) == 1); 
    
#         # check station chosen is the only one appearing on the map
#         tooltip = map.find_elements(By.CLASS_NAME, "leaflet-marker-icon")
#         assert len(tooltip) == 1
#         assert tooltip[0].is_displayed()

#         # click on map element  
#         actions = ActionChains(driver)
#         actions.move_to_element_with_offset(tooltip[0]).perform()
#         actions.click().perform(); 

#         time.sleep(3)

#         # check station graphs work
#         WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.ID, "tempChartContainer")))

#     finally : 
#         time.sleep(5);
        
#         # Close the browser
#         driver.quit()
